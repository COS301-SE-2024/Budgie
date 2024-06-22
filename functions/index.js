/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require('firebase-functions/v2/https');
// const logger = require('firebase-functions/logger');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info('Hello logs!', { structuredData: true });
//   response.send('Hello from Firebase!');
// });
//=====================================================================

// Dependencies for callable functions.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');
//dependencies
const { getDatabase } = require('firebase-admin/database');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, getDoc } = require('firebase-admin/firestore');
initializeApp();

exports.categoriseExpenses = onCall(async (request) => {
  const year = request.data.year;
  const uid = request.auth.uid;
  const doc = await getFirestore().doc(`transaction_data_${year}/${uid}`);
  const docSnap = await doc.get();

  if (docSnap) {
    //can categorize and set
    logger.info(docSnap, { structuredData: true });
  } else {
    logger.info('no data', { structuredData: true });
  }
});
