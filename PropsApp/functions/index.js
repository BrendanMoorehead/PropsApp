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
 