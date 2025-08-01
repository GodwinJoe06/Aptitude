import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200);
    const [results, setResults] = useState();
    const [attempted, setAttempted] = useState(false);
    const [storeResults, setStoreResults] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !submitted) {
                handleSubmitAnswers();
            }
        };

        const handleBeforeUnload = (e) => {
            if (!submitted) {
                handleSubmitAnswers();
            }
            e.preventDefault();
            e.returnValue = '';
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [submitted]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get('https://aptitude-ohar.onrender.com/api/user/questions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestions(res.data);
                setUserAnswers(Array(res.data.length).fill(''));
            } catch (err) {
                console.error(err);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    handleSubmitAnswers();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionChange = (e) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = e.target.value;
        setUserAnswers(updatedAnswers);
    };

    const handleSubmitAnswers = async () => {
        if (submitted) return;
        try {
            for (let i = 0; i < questions.length; i++) {
                await axios.post(
                    'https://aptitude-ohar.onrender.com/api/user/answers',
                    {
                        questionId: questions[i]._id,
                        answer: userAnswers[i] ? userAnswers[i] : 'Not Answered',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting answers:', err);
        }
    };

    useEffect(() => {

        if(!submitted) return;
  const userId = localStorage.getItem('userId'); 

  if (!userId) {
    console.error('User ID not found in localStorage');
    return;
  }

  axios.get(`https://aptitude-ohar.onrender.com/api/user/results?userId=${userId}`)
    .then((res) => {
      setResults(res.data);
      setStoreResults(true);
    })
    .catch((err) => {
      console.error('Error fetching results:', err);
    });
}, [submitted]);

 useEffect(() => {
        const userId = localStorage.getItem('userId');

        if (!userId) return;

        axios
            .get(`https://aptitude-ohar.onrender.com/api/user/attempted?userId=${userId}`)
            .then((res) => {
                if (res.data.alreadyAttended) {
                    setAttempted(true);
                    setSubmitted(true);
                }
            })
    }, []);


    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="dashboard">
            <h2>Interview Test</h2>

            {(attempted || (submitted && storeResults)) && results ? (
                <div>
                    <h3>Test Submitted. Here are your answers:</h3>
                    <progress value={results.score} max={results.answers.length} style={{ width: '100%' }} />
                    <strong>Score:</strong> {results.score}<br />
                    <ul>
                        {questions.map((question, idx) => (
                            <li key={question._id}>
                                <strong>Q{idx + 1}:</strong> {question.question}<br />
                                <strong>Your Answer:</strong> {results.answers[idx].userAnswer || 'Not Answered'}<br />
                                <strong>Correct Answer:</strong> {results.answers[idx]?.correctAnswer || 'N/A'}<br />
                                <strong>Status:</strong> {results.answers[idx]?.isCorrect ? 'Correct' : 'Wrong'}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : questions.length > 0 ? (
                <div className="question-card">
                    <p>Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                    <progress value={timeLeft} max={1200} style={{ width: '100%' }} />
                    <div className="question-navigation">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                className={idx === currentQuestionIndex ? 'active-question' : ''}
                                onClick={() => setCurrentQuestionIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <p><strong>Question {currentQuestionIndex + 1}:</strong> {currentQuestion.question}</p>
                    <div className="options">
                        {currentQuestion.options.map((option, idx) => (
                            <label key={idx} style={{ display: 'block', margin: '8px 0' }}>
                                <input
                                    type="radio"
                                    name={`question-${currentQuestionIndex}`}
                                    value={option}
                                    checked={userAnswers[currentQuestionIndex] === option}
                                    onChange={handleOptionChange}
                                />
                                {option}
                            </label>
                        ))}
                    </div>

                    <div className="navigation-buttons">
                        <button
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                            disabled={currentQuestionIndex === questions.length - 1}
                        >
                            Next
                        </button>
                    </div>

                    {currentQuestionIndex === questions.length - 1 && (
                        <button className="submit-btn" onClick={handleSubmitAnswers}>
                            Submit
                        </button>
                    )}
                </div>
            ) : (
                <p>Loading questions...</p>
            )}
        </div>
    );
};

export default Questions;
