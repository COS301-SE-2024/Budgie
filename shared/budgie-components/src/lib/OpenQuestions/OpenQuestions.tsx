'use client';
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  getFirestore,
  doc,
  updateDoc,
  addDoc,
  getDoc,
} from 'firebase/firestore';

export interface OpenQuestionsProps {
  onClose: () => void;
}

export function OpenQuestions(props: OpenQuestionsProps) {
  const [openQuestions, setOpenQuestions] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // State to track user votes
  const [newQuestion, setNewQuestion] = useState(''); // State for new question input
  const db = getFirestore();
  const questionsCollectionRef = collection(db, 'questions');

  useEffect(() => {
    const unsubscribe = onSnapshot(questionsCollectionRef, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter only open questions
      const filteredOpenQuestions = questions.filter((q) => q.isOpen);
      setOpenQuestions(filteredOpenQuestions);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const voteQuestion = async (questionId, type) => {
    const questionRef = doc(db, 'questions', questionId);
    const questionDoc = await getDoc(questionRef);

    // Update likes or dislikes based on the vote type
    if (questionDoc.exists()) {
      const question = questionDoc.data();
      if (type === 'upvote') {
        await updateDoc(questionRef, { likes: (question.likes || 0) + 1 });
        setUserVotes((prev) => ({ ...prev, [questionId]: 'upvote' }));
      } else if (type === 'downvote') {
        await updateDoc(questionRef, {
          dislikes: (question.dislikes || 0) + 1,
        });
        setUserVotes((prev) => ({ ...prev, [questionId]: 'downvote' }));
      }
    }
  };

  const answerQuestion = async (questionId, answer) => {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      answer: answer, // Assuming you're storing the answer in the same document
      isOpen: false, // Mark the question as answered
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      // Add the new question to Firestore
      const newQuestionData = {
        question: newQuestion,
        isOpen: true,
        likes: 0,
        dislikes: 0,
        answer: '',
      };

      const docRef = await addDoc(questionsCollectionRef, newQuestionData);
      console.log('New question added with ID:', docRef.id); // Optional: log the new question ID
      setNewQuestion(''); // Clear input field
    }
  };

  return (
    <div
      className="flex flex-col shadow-lg z-10 fixed top-0 right-0 bg-[var(--main-background)] p-8 h-full overflow-y-auto"
      style={{ width: '85vw', maxHeight: '100vh' }}
    >
      <div className="flex items-center mb-4">
        <span
          className="material-symbols-outlined cursor-pointer text-gray-600"
          style={{ fontSize: '1.5rem', marginRight: '10px' }} // Add margin to separate from heading
          onClick={props.onClose}
          title="Close"
        >
          arrow_back
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Open Questions</h1>
      </div>

      {/* Add Question Form */}
      <form onSubmit={handleAddQuestion} className="mb-4">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Add a new question..."
          className="p-2 border rounded mb-2 w-full text-gray-900 bg-white"
        />
        <button
          type="submit"
          className="bg-green-500 text-white rounded p-2 mt-2"
        >
          Add Question
        </button>
      </form>

      {openQuestions.length === 0 ? (
        <p className="text-gray-800">No open questions available.</p>
      ) : (
        openQuestions.map((question) => (
          <div
            key={question.id}
            className="p-6 bg-white shadow-lg rounded-lg mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {question.question}
            </h3>
            <p className="text-gray-800">Likes: {question.likes || 0}</p>
            <p className="text-gray-800">Dislikes: {question.dislikes || 0}</p>
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={() => voteQuestion(question.id, 'upvote')}
                disabled={userVotes[question.id] === 'downvote'} // Disable if already downvoted
                className={`flex items-center ${
                  userVotes[question.id] === 'upvote'
                    ? 'text-green-600'
                    : 'text-gray-800'
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
                    : 'text-gray-800'
                }`}
              >
                <span className="material-symbols-outlined">thumb_down</span>
                Downvote
              </button>
              <span className="text-gray-800">{question.dislikes || 0}</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                answerQuestion(question.id, e.target.answer.value);
                e.target.answer.value = ''; // Clear input after submitting
              }}
              className="mt-4"
            >
              <input
                type="text"
                name="answer"
                placeholder="Your answer here..."
                className="p-2 border rounded mb-2 w-full text-gray-900 bg-white"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded p-2 mt-2"
              >
                Submit Answer
              </button>
            </form>
          </div>
        ))
      )}
      <div className="mt-4">
        <button
          onClick={props.onClose}
          className="bg-red-500 text-white rounded p-2 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default OpenQuestions;
