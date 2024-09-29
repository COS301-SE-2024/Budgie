const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

sgMail.setApiKey();
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
  const Transfer = ['transfer'];
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
    Transfer: 'Transfer',
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
    Transfer,
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
  { timeoutSeconds: 300, memory: '1GiB', cpu: 2 },
  async (request) => {
    await initialize();

    const year = request.data.year;
    const uid = request.auth.uid;
    const accRef = getFirestore().collection(`transaction_data_${year}`);
    const snapshot = await accRef.where('uid', '==', uid).get();

    const updatePromises = snapshot.docs.map(async (doc) => {
      for (const month of Months) {
        let updateFlag = false;
        if (doc.data()[month]) {
          const IncomingMonthData = JSON.parse(doc.data()[month]);
          const updatedTransactions = await Promise.all(
            IncomingMonthData.map(async (transaction) => {
              if (transaction.category === '') {
                updateFlag = true;
                let newCategory = '';
                newCategory = useKnownList(transaction.description);

                if (transaction.amount > 0 && newCategory != 'Transfer') {
                  newCategory = 'Income';
                }
                if (newCategory === '') {
                  newCategory = await useModel(transaction.description);
                }
                if (newCategory === 'Fuel') {
                  if (Math.abs(parseFloat(transaction.amount)) < 100) {
                    newCategory = 'Eating Out';
                  } else {
                    newCategory = 'Transport';
                  }
                }
                return { ...transaction, category: newCategory };
              }
              return transaction;
            })
          );
          if (updateFlag) {
            await getFirestore()
              .doc(`transaction_data_${year}/${doc.id}`)
              .update({ [month]: JSON.stringify(updatedTransactions) });
          }
        }
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);
  }
);

const corsHandler = cors({ origin: true });
exports.sendGoalProgressEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(403).send('Forbidden!');
    }

    const { userId, userEmail, userName, title, progress } = req.body;
    admin
      .auth()
      .getUser(userId)
      .then((userRecord) => {
        console.log('User Email:', userRecord.email);
        userEmail = userRecord.email;
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
    if (progress >= 100) {
      const msg = {
        to: userEmail,
        from: 'budgie202406@gmail.com',
        subject: 'Congratulations! You achieved your goal!',
        text: `Hi ${userName},\n\nYou've successfully reached your goal: ${title}. Great job!`,
      };

      await sgMail.send(msg);
      console.log('Email sent for goal completion');
      return res.status(200).send('Email sent successfully');
    }

    if (progress >= 50) {
      const msg = {
        to: userEmail,
        from: 'budgie202406@gmail.com',
        subject: 'Congratulations! You are halfway to your goal!',
        text: `Hi ${userName},\n\nYou've successfully reached ${progress}% to your goal: ${title}. Keep going!`,
      };

      await sgMail.send(msg);
      console.log('Email sent for ' + progress + '% mark');
      return res.status(200).send('Email sent successfully');
    }

    return res.status(200).send('No email sent; progress not sufficient.');
  });
});

exports.sendEmailNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(403).send('Forbidden! Only POST requests are allowed.');
    }
    const { userId, userEmail, threshold, spentPercentage } = req.body;

    try {
      if (spentPercentage >= threshold) {
        const msg = {
          to: userEmail,
          from: 'budgie202406@gmail.com',
          subject: `You have spent over ${threshold}% of your income`,
          text: `Hi, you have reached ${spentPercentage.toFixed(
            2
          )}% of your income in account. Please monitor your spending.`,
        };

        await sgMail.send(msg);
        return res.status(200).send('Email sent successfully');
      }
      return res
        .status(200)
        .send('No email sent; spending is below the threshold.');
    } catch (error) {
      console.error('Error sending email or fetching user data:', error);
      return res
        .status(500)
        .send('Failed to send email or retrieve user information');
    }
  });
});

exports.csvUploadReminder = onSchedule('every 24 hours', async () => {
  const firestore = getFirestore();
  const now = new Date();
  const thresholdDays = 7;
  let email;
  try {
    const userSettingsRef = firestore.collection('usersSettings');
    const settingsSnapshot = await userSettingsRef
      .where('csv', '==', true)
      .get();
    if ((await settingsSnapshot).size === 0) {
      console.log('No users with CSV reminders enabled.');
      return null;
    }
    console.log((await settingsSnapshot).docs.toString);
    if (!settingsSnapshot.empty) {
      const usersWithCsvNotifications =
        settingsSnapshot.docs?.map((doc) => doc.id) || [];
      console.log(
        `Found ${await settingsSnapshot.size} users with CSV reminders enabled.`
      );
      console.log('Users with CSV notifications:', usersWithCsvNotifications);
      const overdueUsers = [];
      for (const userId of usersWithCsvNotifications) {
        const userDocRef = firestore.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log('User document found:', userData);
          email = userData.email;
          if (userData.lastCSVUpload) {
            const daysSinceUpload = Math.floor(
              (now - userData.lastCSVUpload.toDate()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceUpload >= thresholdDays) {
              overdueUsers.push({
                email: userData.email,
                displayName: userData.displayName,
              });
            }
          } else {
            console.log(`No lastCSVUpload data found for user: ${userId}`);
          }
        } else {
          console.log(`No user document found for user ID: ${userId}`);
        }
      }
      if (email) {
        if (overdueUsers.length > 0) {
          const msg = {
            to: email,
            from: 'budgie202406@gmail.com',
            subject: 'CSV Upload Reminder',
            text: `Dear user, you haven't uploaded a CSV file in over ${thresholdDays} days.`,
          };

          return sgMail.send(msg);
        }
      } else {
        console.log(`Skipping user as no email address is found.`);
        return Promise.resolve();
      }
      await Promise.all(emailPromises);
      console.log(`Sent ${overdueUsers.length} CSV upload reminders.`);
    } else {
      console.log('No overdue users to send reminders to.');
    }

    return null;
  } catch (error) {
    console.error('Error sending CSV upload reminders:', error);
    return null;
  }
});
