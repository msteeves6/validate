const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection string
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
            "YearAchived": yearAchieved
        });

        client.close();

        if (record) {
            res.send('true');
        } else {
            res.send('false');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to verify age with corrected field name
app.post('/validateAge', async (req, res) => {
    const { firstName, lastName, birthDate, dlNumber, expirationDate, state } = req.body;
    console.log("Received data:", req.body);
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
            "Experation Date": formattedExpirationDate,
            "State": state
        });

        client.close();

        if (record) {
            res.send('true');
        } else {
            res.send('false');
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
