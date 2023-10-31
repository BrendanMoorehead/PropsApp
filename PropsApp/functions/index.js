/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const axios = require('axios');
 admin.initializeApp();
 
 const db = admin.firestore();
 
 exports.addMessage = functions.https.onRequest(async (req, res) => {
     const original = req.query.text;
     try {
         const writeResult = await db.collection('messages').add({ original: original });
         res.json({ result: `Message with ID: ${writeResult.id} added.` });
     } catch (error) {
         console.error("Error adding message", error);
         res.status(500).send(error);
     }
 });
 
 exports.makeUppercase = functions.firestore.document('/messages/{documentId}').onCreate((snapshot, context) => {
     const original = snapshot.data().original;
     functions.logger.log('Uppercasing', context.params.documentId, original);
     const uppercase = original.toUpperCase();
     return snapshot.ref.set({ uppercase }, { merge: true });
 });
 
 exports.getNFLGames = functions.https.onRequest(async (req, res) => {
    try {
        const date = '2023-11-05';
        const apiKey = 'w2KtYORgPjQM5ZRT4SPzo4kSKH1yPrhxadgNgavs1s';
        const apiUrl = `https://api.prop-odds.com/beta/games/nfl?date=${date}&tz=America/New_York&api_key=${apiKey}`;

        const response = await axios.get(apiUrl);
        const games = response.data;
        await admin.firestore().collection('nflGames').doc('2023-11-05').set(games);
        res.status(200).send("Games added successfully.");
    } catch (error) {
        console.error('Error fetching NFL games:', error);
        res.status(500).send('Internal Server Error');
    }
});

