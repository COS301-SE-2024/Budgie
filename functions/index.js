// Dependencies for callable functions.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');
//dependencies
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
let categoryEmbeddings;
let pipe;

async function initialize() {
  const { pipeline } = await import('@xenova/transformers');
  pipe = await pipeline('feature-extraction', 'Supabase/gte-small');
  await initializeCategoryEmbeddings(pipe);
}

async function initializeCategoryEmbeddings(pipe) {
  categoryEmbeddings = await Promise.all(
    categories.map(async (category) => {
      const output = await pipe(category, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    })
  );
}

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
    logger.error('Error in useModel:', error);
  }
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

exports.categoriseExpenses = onCall(
  { timeoutSeconds: 180, memory: '2GiB', cpu: 4 },
  async (request) => {
    await initialize();

    const year = request.data.year;
    const uid = request.auth.uid;
    const accRef = getFirestore().collection(`transaction_data_${year}`);
    const snapshot = await accRef.where('uid', '==', uid).get();

    snapshot.forEach(async (doc) => {
      let updateFlag = false;
      //can categorize and set
      for (month of Months) {
        logger.info(month);
        if (doc.data()[month]) {
          const IncomingMonthData = JSON.parse(doc.data()[month]);
          for (transaction of IncomingMonthData) {
            if (transaction.category == '') {
              updateFlag = true;
              let newCategory = '';
              if (transaction.amount > 0) {
                newCategory = 'Income';
              }
              if (newCategory == '') {
                newCategory = await useKnownList(transaction.description);
              }
              if (newCategory == '') {
                newCategory = await useModel(transaction.description);
              }
              if (newCategory == 'Fuel') {
                if (Math.abs(parseFloat(transaction.amount)) < 100) {
                  newCategory = 'Eating Out';
                } else {
                  newCategory = 'Transport';
                }
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
  }
);
