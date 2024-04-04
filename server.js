const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

// Use the port specified by the environment variable in Azure, or 3000 when running locally
const port = process.env.PORT || 3000;

// MongoDB connection string
// Ensure this connection string is correct and that your Azure App Service's IP is allowed in MongoDB Atlas
const mongoUrl = "mongodb+srv://credhub57:CredHub*2024@credhub.dglqyvp.mongodb.net/?retryWrites=true&w=majority&appName=CredHub";

app.use(bodyParser.json());

// Function to convert date formats with validation
function convertDate(dateString, format) {
    if (!dateString || dateString.split('/').length !== 3) {
        console.error('Invalid date format:', dateString);
        return dateString; // Return original string or handle as needed
    }

    const parts = dateString.split('/');
    if (parts[0] && parts[1] && parts[2]) {
        switch (format) {
            case 'ISO':
                // Convert MM/DD/YYYY to YYYY-MM-DD
                return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            case 'noLeadingZeros':
                // Convert MM/DD/YYYY to MM/DD/YYYY without leading zeros
                return `${parseInt(parts[0], 10)}/${parseInt(parts[1], 10)}/${parts[2]}`;
            default:
                return dateString;
        }
    } else {
        console.error('Date string parts undefined:', dateString);
        return dateString; // Return original string or handle as needed
    }
}

// Endpoint to verify degree information
app.post('/validateDegree', async (req, res) => {
    const { firstName, lastName, birthDate, university, schoolID, degreeType, degreeAwarded, yearAchieved } = req.body;
    const dbName = 'UWDegree';
    const collectionName = 'DegreeData';

    // Converting birthDate format
    const formattedBirthDate = convertDate(birthDate, 'noLeadingZeros');

    try {
        const client = await MongoClient.connect(mongoUrl);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const record = await collection.findOne({
            "First Name": firstName,
            "Last Name": lastName,
            "Birth Date": formattedBirthDate,
            "University": university,
            "SchoolID": schoolID,
            "DegreeType": degreeType,
            "DegreeAwarded": degreeAwarded,
            "YearAchieved": yearAchieved // Corrected typo from "YearAchived" to "YearAchieved"
        });

        client.close();

        if (record) {
            res.json({ DegreeValidated: true });
        } else {
            res.json({ DegreeValidated: false });
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to verify age
app.post('/validateAge', async (req, res) => {
    const { firstName, lastName, birthDate, dlNumber, expirationDate, state } = req.body;
    const dbName = 'WyoID';
    const collectionName = 'idData';

    // Converting birthDate and expirationDate format
    const formattedBirthDate = convertDate(birthDate, 'ISO');
    const formattedExpirationDate = convertDate(expirationDate, 'ISO');

    try {
        const client = await MongoClient.connect(mongoUrl);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const record = await collection.findOne({
            "First Name": firstName,
            "Last Name": lastName,
            "Birth Date": formattedBirthDate,
            "DL Number": dlNumber,
            "Expiration Date": formattedExpirationDate, // Corrected typo from "Experation Date" to "Expiration Date"
            "State": state
        });

        client.close();

        if (record) {
            res.json({ ageValidated: true });
        } else {
            res.json({ ageValidated: false });
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).send('Internal server error');
    }
});

// Respond to GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Validation Server. Use the /validateDegree or /validateAge endpoints.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
