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
import { getAuth } from 'firebase/auth';
import { OpenQuestions } from '../OpenQuestions/OpenQuestions';

/* eslint-disable-next-line */
export interface FaqModalProps {
  onClose: () => void;
}

// Interface for a Question object
interface Question {
  id: string;
  question: string;
  answer?: string;
  likes: number;
  dislikes: number;
  isOpen: boolean;
}

// Interface for storing user votes
interface UserVotes {
  [questionId: string]: 'upvote' | 'downvote';
}

export function FaqModal(props: FaqModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userQuestions, setUserQuestions] = useState<Question[]>([]); // Holds the top ranked questions
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // Holds all questions
  const [openQuestions, setOpenQuestions] = useState<Question[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [showOpen, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); // Loading state

  const handleCloseQ = () => {
    setOpen(false);
  };

  const db = getFirestore();
  const questionsCollectionRef = collection(db, 'questions');

  const user = getAuth()?.currentUser;
  const userId = user?.uid || ''; // Ensure userId is a string, fallback to empty string if user is not authenticated

  useEffect(() => {
    const unsubscribe = onSnapshot(questionsCollectionRef, (snapshot) => {
      const questions: Question[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        question: doc.data().question,
        answer: doc.data().answer,
        likes: doc.data().likes || 0,
        dislikes: doc.data().dislikes || 0,
        isOpen: doc.data().isOpen,
      }));

      const rankedQuestions = questions
        .map((q: Question) => ({
          ...q,
          ratio:
            (q.likes || 0) /
            (Math.abs(q.likes || 0) + Math.abs(q.dislikes || 0) || 1), // Avoid division by zero
        }))
        .sort((a, b) => b.ratio - a.ratio) // Sort by ratio in descending order
        .slice(0, 5); // Get only the top 5 questions

      const openQuestions = rankedQuestions.filter((q) => q.isOpen);
      setUserQuestions(rankedQuestions);
      setAllQuestions(questions); // Store all questions for filtering
      setOpenQuestions(openQuestions);
      setLoading(false); // Set loading to false once data is loaded
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [questionsCollectionRef]);

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!userId) return; // If no user is authenticated, return early
      const userVotesRef = doc(db, 'userVotes', userId);
      const userVotesDoc = await getDoc(userVotesRef);
      if (userVotesDoc.exists()) {
        setUserVotes(userVotesDoc.data().votes || {});
      }
    };
    fetchUserVotes();
  }, [userId, db]);

  const answerQuestion = async (id: string, answer: string) => {
    const questionRef = doc(db, 'questions', id);
    await updateDoc(questionRef, {
      answer: answer,
      isOpen: false, // Mark question as answered
    });
  };

  const voteQuestion = async (id: string, type: 'upvote' | 'downvote') => {
    const questionRef = doc(db, 'questions', id);

    const questionDoc = await getDoc(questionRef);
    const currentLikes = questionDoc.exists()
      ? questionDoc.data().likes || 0
      : 0;
    const currentDislikes = questionDoc.exists()
      ? questionDoc.data().dislikes || 0
      : 0;
    const userVote = userVotes[id];

    let newLikes = currentLikes;
    let newDislikes = currentDislikes;

    if (userVote === 'upvote' && type === 'downvote') {
      newLikes -= 1;
      newDislikes += 1;
    } else if (userVote === 'downvote' && type === 'upvote') {
      newLikes += 1;
      newDislikes -= 1;
    } else if (userVote === type) {
      return;
    } else if (userVote === undefined) {
      if (type === 'upvote') {
        newLikes += 1;
      } else {
        newDislikes += 1;
      }
    }

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
          [id]: type,
        },
      },
      { merge: true }
    );

    setUserVotes((prevVotes) => ({ ...prevVotes, [id]: type }));
  };

  const filteredQuestions = [
    ...openQuestions,
    ...userQuestions,
    ...allQuestions,
  ]
    .filter((question) =>
      searchQuery.trim() !== ''
        ? question.question.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .reduce<Question[]>((acc, question) => {
      const questionIds = new Set(acc.map((q) => q.id));
      if (!questionIds.has(question.id)) {
        acc.push(question);
      }
      return acc;
    }, []);

  filteredQuestions.sort((a, b) => b.likes - a.likes);

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

        <input
          type="text"
          placeholder="Search..."
          className="p-2 border rounded mb-4 w-full text-gray-900 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {showOpen && <OpenQuestions onClose={handleCloseQ} />}

        {loading ? (
          <div className="text-center py-4">
            <p>Loading questions...</p>
          </div >
        ) : (
          <div className='h-[80vh] overflow-y-scroll'>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-6 bg-white shadow-lg rounded-lg mb-4"
                >
                  <h3 className="text-lg font-bold text-[var(--primary-1)] mb-2">
                    {question.question}
                  </h3>
                  {question.answer && (
                    <p className="text-gray-900 mb-4">{question.answer}</p>
                  )}
                 {/*} <div className="flex items-center">
                    <span
                      className="material-symbols-outlined cursor-pointer mr-2"
                      onClick={() => voteQuestion(question.id, 'upvote')}
                      style={{ fontSize: '24px' }}
                    >
                      thumb_up
                    </span>
                    <span>{question.likes}</span>
                    <span
                      className="material-symbols-outlined cursor-pointer ml-4 mr-2"
                      onClick={() => voteQuestion(question.id, 'downvote')}
                      style={{ fontSize: '24px' }}
                    >
                      thumb_down
                    </span>
                    <span>{question.dislikes}</span>
                  </div>*/}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p>No questions found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FaqModal;
