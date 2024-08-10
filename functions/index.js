/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
//   logger.info('Hello logs!', { structuredData: true });

// Dependencies for callable functions.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');
//dependencies
const { getDatabase } = require('firebase-admin/database');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
let pipeline;
let categoryEmbeddings;

const Months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

const categories = [
  'Transport',
  'Eating Out',
  'Groceries',
  'Entertainment',
  'Shopping',
  'Insurance',
  'Utilities',
  'Medical Aid',
  'Other',
];

async function useModel(transactionDescription) {
  try {
    if (!pipeline) {
      await initializePipeline();
    }

    const pipe = await pipeline('feature-extraction', 'Supabase/gte-small');

    if (!categoryEmbeddings) {
      await initializeCategoryEmbeddings(pipe);
    }

    // Generate embedding for the transaction description
    const descriptionOutput = await pipe(transactionDescription, {
      pooling: 'mean',
      normalize: true,
    });
    const descriptionEmbedding = Array.from(descriptionOutput.data);

    // Calculate similarities
    let maxSimilarity = -1;
    let closestCategory = '';

    for (let i = 0; i < categories.length; i++) {
      const similarity = cosineSimilarity(
        descriptionEmbedding,
        categoryEmbeddings[i]
      );
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        closestCategory = categories[i];
      }
    }

    return closestCategory;
  } catch (error) {
    logger.log(error);
  }
}

async function initializePipeline() {
  const transformers = await import('@xenova/transformers');
  pipeline = transformers.pipeline;
}

async function initializeCategoryEmbeddings(pipe) {
  categoryEmbeddings = await Promise.all(
    categories.map(async (category) => {
      const output = await pipe(category, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    })
  );
}

function cosineSimilarity(embedding1, embedding2) {
  const dotProduct = embedding1.reduce(
    (sum, val, i) => sum + val * embedding2[i],
    0
  );
  const magnitude1 = Math.sqrt(
    embedding1.reduce((sum, val) => sum + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    embedding2.reduce((sum, val) => sum + val * val, 0)
  );
  return dotProduct / (magnitude1 * magnitude2);
}

function useKnownList(description) {
  const Fuel = [
    'fuel',
    'bp',
    'astron',
    'caltex',
    'sasol',
    'shell',
    'total',
    'engen',
    'petrol',
  ];
  const Transport = ['transport', 'bolt', 'taxi', 'rides', 'parking', 'parkin'];
  const EatingOut = [
    'wimpy',
    'eats',
    'mrd',
    'mr d',
    'spur',
    'rocomamas',
    'mc',
    'steers',
    'burger',
    'pizza',
    'kfc',
    'bk',
    'chicken',
    'uncle',
    'mochachos',
    'anat',
    'restaurant',
  ];
  const Groceries = [
    'butcher',
    'butch',
    'tops',
    'pnp',
    'woolworths',
    'shoprite',
    'checkers',
    'spar',
    'shop',
    'liquor',
  ];
  const Entertainment = [
    'netflix',
    'amazon',
    'disney',
    'vodacom',
    'airtime',
    'data',
    'cell',
    'showmax',
  ];
  const Shopping = [
    'h&m',
    'cottonon',
    'cotton on',
    'zara',
    'clothing',
    'mr price',
    'mrprice',
    'mrp',
    'sportsmans',
    'ackermans',
    'pep',
  ];
  const Insurance = [];
  const Utilities = [];
  const MedicalAid = [];
  const Other = ['yoco', 'fnb', 'capitec', 'nedbank'];
  const categories = {
    Fuel: 'Fuel',
    Transport: 'Transport',
    EatingOut: 'Eating Out',
    Groceries: 'Groceries',
    Entertainment: 'Entertainment',
    Shopping: 'Shopping',
    Insurance: 'Insurance',
    Utilities: 'Utilities',
    MedicalAid: 'Medical Aid',
    Other: 'Other',
  };
  const categoryKeywords = {
    Fuel,
    Transport,
    EatingOut,
    Groceries,
    Entertainment,
    Shopping,
    Insurance,
    Utilities,
    MedicalAid,
    Other,
  };

  description = description.toLowerCase();

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (description.includes(keyword)) {
        return categories[key];
      }
    }
  }

  return '';
}

exports.categoriseExpenses = onCall(async (request) => {
  const year = request.data.year;
  const uid = request.auth.uid;
  // const doc = await getFirestore().doc(`transaction_data_${year}/${uid}`);
  // const docSnap = await doc.get();

  const accRef = getFirestore().collection(db, `transaction_data_${year}`);
  const q = query(accRef, where('uid', '==', user.uid));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (doc) => {
    let updateFlag = false;
    //can categorize and set
    for (month of Months) {
      if (doc.data()[month]) {
        const IncomingMonthData = JSON.parse(doc.data()[month]);
        for (transaction of IncomingMonthData) {
          if (transaction.category === '') {
            updateFlag = true;
            newCategory = useKnownList(transaction.description);
            if (
              newCategory == 'Fuel' &&
              Math.abs(parseFloat(transaction.amount) < 100)
            ) {
              newCategory == 'Eating Out';
            } else {
              newCategory == 'Transport';
            }
            if (newCategory == '') {
              newCategory = await useModel(transaction.description);
            }
            transaction.category = newCategory;
          }
        }
        if (updateFlag) {
          await getFirestore()
            .doc(`transaction_data_${year}/${doc.id}`)
            .update({ [month]: JSON.stringify(IncomingMonthData) });
        }
      }
    }
  });

  // if (docSnap) {
  //   let updateFlag = false;
  //   //can categorize and set
  //   for (month of Months) {
  //     if (docSnap.data()[month]) {
  //       const IncomingMonthData = JSON.parse(docSnap.data()[month]);
  //       for (transaction of IncomingMonthData) {
  //         if (transaction.category === '') {
  //           updateFlag = true;
  //           newCategory = useKnownList(transaction.description);
  //           if (
  //             newCategory == 'Fuel' &&
  //             Math.abs(parseFloat(transaction.amount) < 100)
  //           ) {
  //             newCategory == 'Eating Out';
  //           } else {
  //             newCategory == 'Transport';
  //           }
  //           if (newCategory == '') {
  //             newCategory = await useModel(transaction.description);
  //           }
  //           transaction.category = newCategory;
  //         }
  //       }
  //       if (updateFlag) {
  //         await getFirestore()
  //           .doc(`transaction_data_${year}/${uid}`)
  //           .update({ [month]: JSON.stringify(IncomingMonthData) });
  //       }
  //     }
  //   }
  // }
});
