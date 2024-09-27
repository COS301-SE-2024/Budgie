import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  getFirestore,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { OpenQuestions } from '../OpenQuestions/OpenQuestions';

/* eslint-disable-next-line */
export interface FaqModalProps {
  onClose: () => void;
}

export function FaqModal(props: FaqModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userQuestions, setUserQuestions] = useState([]); // Holds the top ranked questions
  const [allQuestions, setAllQuestions] = useState([]); // Holds all questions
  const [openQuestions, setOpenQuestions] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [showOpen, setOpen] = useState<boolean>(false);

  const handleCloseQ = () => {
    setOpen(false);
  };

  const db = getFirestore();
  const questionsCollectionRef = collection(db, 'questions');

  // Simulate a user ID (replace this with actual user identification logic)
  const userId = 'user123'; // This should be replaced with actual user ID from authentication

  useEffect(() => {
    const unsubscribe = onSnapshot(questionsCollectionRef, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate the ratio of likes to dislikes for ranking
      const rankedQuestions = questions
        .map((q) => ({
          ...q,
          ratio:
            (q.likes || 0) /
            (Math.abs(q.likes || 0) + Math.abs(q.dislikes || 0) || 1), // Avoid division by zero
        }))
        .sort((a, b) => b.ratio - a.ratio) // Sort by ratio in descending order
        .slice(0, 5); // Get only the top 5 questions

      // Separate open and answered questions
      const openQuestions = rankedQuestions.filter((q) => q.isOpen);
      setUserQuestions(rankedQuestions);
      setAllQuestions(questions); // Store all questions for filtering
      setOpenQuestions(openQuestions);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Fetch user votes from Firestore
  useEffect(() => {
    const fetchUserVotes = async () => {
      const userVotesRef = doc(db, 'userVotes', userId);
      const userVotesDoc = await getDoc(userVotesRef);
      if (userVotesDoc.exists()) {
        setUserVotes(userVotesDoc.data().votes || {});
      }
    };
    fetchUserVotes();
  }, []);

  const answerQuestion = async (id, answer) => {
    const questionRef = doc(db, 'questions', id);
    await updateDoc(questionRef, {
      answer: answer,
      isOpen: false, // Mark question as answered
    });
  };

  const voteQuestion = async (id, type) => {
    const questionRef = doc(db, 'questions', id);

    // Retrieve current likes, dislikes, and user's vote
    const questionDoc = await getDoc(questionRef);
    const currentLikes = questionDoc.exists() ? questionDoc.data().likes : 0;
    const currentDislikes = questionDoc.exists()
      ? questionDoc.data().dislikes
      : 0;
    const userVote = userVotes[id];

    let newLikes = currentLikes;
    let newDislikes = currentDislikes;

    // Check if the user is changing their vote
    if (userVote === 'upvote' && type === 'downvote') {
      newLikes -= 1; // Remove upvote
      newDislikes += 1; // Add downvote
    } else if (userVote === 'downvote' && type === 'upvote') {
      newLikes += 1; // Add upvote
      newDislikes -= 1; // Remove downvote
    } else if (userVote === type) {
      // If the user is voting the same way, do nothing
      return;
    } else if (userVote === undefined) {
      // User is voting for the first time
      if (type === 'upvote') {
        newLikes += 1; // Increment likes
      } else {
        newDislikes += 1; // Increment dislikes
      }
    }

    // Update likes, dislikes, and user votes in Firestore
    await updateDoc(questionRef, {
      likes: newLikes,
      dislikes: newDislikes,
    });

    const userVotesRef = doc(db, 'userVotes', userId);
    await setDoc(
      userVotesRef,
      {
        votes: {
          ...userVotes,
          [id]: type, // Store the vote type (upvote or downvote)
        },
      },
      { merge: true }
    );

    // Update local userVotes state
    setUserVotes((prevVotes) => ({ ...prevVotes, [id]: type }));
  };

  // Filter questions based on the search query for partial matches when there's input text
  const filteredQuestions = [
    ...openQuestions,
    ...userQuestions,
    ...allQuestions,
  ]
    .filter(
      (question) =>
        searchQuery.trim() !== '' // Only filter if there's text in the input
          ? question.question.toLowerCase().includes(searchQuery.toLowerCase())
          : true // If no text, include all questions
    )
    .reduce((acc, question) => {
      // Use Set to filter out duplicates based on question ID
      const questionIds = new Set(acc.map((q) => q.id));
      if (!questionIds.has(question.id)) {
        acc.push(question);
      }
      return acc;
    }, []); // Initialize with an empty array

  // Sort the filtered questions if needed
  filteredQuestions.sort((a, b) => b.likes - a.likes); // Sort by likes (or any other criteria)

  return (
    <div
      className="flex flex-col shadow-lg z-10 fixed top-0 right-0 bg-[var(--main-background)] p-8 h-full overflow-y-auto"
      style={{ width: '85vw', maxHeight: '100vh' }}
    >
      <div className="pageTitle">
        <span
          className="material-symbols-outlined cursor-pointer"
          style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
          onClick={props.onClose}
        >
          arrow_back
        </span>
        FAQs
      </div>
      <div className="p-4 bg-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold text-green-600 mb-6">
          Frequently Asked Questions
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border rounded mb-4 w-full text-gray-900 bg-white" // Updated styles
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Button to navigate to Open Questions page */}
        <button
          onClick={() => {
            setOpen(!showOpen);
          }}
          className="bg-blue-500 text-white rounded p-2 mt-4"
        >
          View Open Questions
        </button>
        {showOpen && <OpenQuestions onClose={handleCloseQ} />}

        {/* Display filtered questions */}
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="p-6 bg-white shadow-lg rounded-lg mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {question.question}
              </h3>
              {question.isOpen ? null : (
                <p className="text-gray-800">{question.answer}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => voteQuestion(question.id, 'upvote')}
                  disabled={userVotes[question.id] === 'downvote'} // Disable if already downvoted
                  className={`flex items-center ${
                    userVotes[question.id] === 'upvote'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="material-symbols-outlined">thumb_up</span>
                  Upvote
                </button>
                <span className="text-gray-800">{question.likes || 0}</span>
                <button
                  onClick={() => voteQuestion(question.id, 'downvote')}
                  disabled={userVotes[question.id] === 'upvote'} // Disable if already upvoted
                  className={`flex items-center ${
                    userVotes[question.id] === 'downvote'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="material-symbols-outlined">thumb_down</span>
                  Downvote
                </button>
                <span className="text-gray-800">{question.dislikes || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No questions found.</p>
        )}
      </div>
    </div>
  );
}

export default FaqModal;
