const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection string
const mongoUrl = "mongodb+srv://credhub57:CredHub*2024@credhub.dglqyvp.mongodb.net/?retryWrites=true&w=majority&appName=CredHub";

app.use(bodyParser.json());

function sanitizeAndValidateDate(dateString) {
    const trimmedDate = dateString.trim();
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    return dateRegex.test(trimmedDate) ? trimmedDate : null;
}

// Function to sanitize and escape single quotes
function sanitizeAndEscapeQuotes(inputString) {
    return inputString.replace(/'/g, "''");
}

app.post('/validateAge', async (req, res) => {
    let client; 
    try {
        client = await MongoClient.connect(mongoUrl);
        const db = client.db('WyoID');
        const collection = db.collection('idData');

        let { firstName, lastName, birthDate, dlNumber, expirationDate, state } = req.body;
        
        birthDate = sanitizeAndValidateDate(birthDate);
        expirationDate = sanitizeAndValidateDate(expirationDate);

        if (!birthDate || !expirationDate) {
            return res.status(400).send('Invalid date format');
        }
        
        const query = {
            "First Name": firstName,
            "Last Name": lastName,
            "Birth Date": birthDate,
            "DL Number": dlNumber,
            "Experation Date": expirationDate,
            "State": state
        };

        const record = await collection.findOne(query);
        res.send(record ? 'true' : 'false');
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        res.status(500).send('Internal server error');
    } finally {
        if (client) {
            await client.close(); 
        }
    }
});

app.post('/validateDegree', async (req, res) => {
    let client; 
    try {
        client = await MongoClient.connect(mongoUrl);
        const db = client.db('UWDegree'); 
        const collection = db.collection('DegreeData');

        let { firstName, lastName, birthDate, university, schoolId, degreeType, degreeAwarded, yearAchieved } = req.body;

        birthDate = sanitizeAndValidateDate(birthDate);
        if (!birthDate) {
            return res.status(400).send('Invalid date format for birthDate');
        }

        // Sanitize and escape single quotes
        firstName = sanitizeAndEscapeQuotes(firstName);
        lastName = sanitizeAndEscapeQuotes(lastName);
        university = sanitizeAndEscapeQuotes(university);
        degreeType = sanitizeAndEscapeQuotes(degreeType);
        degreeAwarded = sanitizeAndEscapeQuotes(degreeAwarded);

        const query = {
            "First Name": firstName,
            "Last Name": lastName,
            "Birth Date": birthDate,
            "University": university,
            "SchoolID": schoolId,
            "DegreeType": degreeType,
            "DegreeAwarded": degreeAwarded,
            "YearAchieved": yearAchieved
        };

        const record = await collection.findOne(query);
        res.send(record ? 'true' : 'false');
    } catch (error) {
        console.error("Error during database operation: ", error);
        res.status(500).send('Internal server error');
    } finally {
        if (client) {
            await client.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
