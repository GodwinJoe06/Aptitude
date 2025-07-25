import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200); 

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
}, [submitted, questions, userAnswers]);


    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('https://aptitude-ohar.onrender.com/api/user/questions', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setQuestions(response.data);
                setUserAnswers(Array(response.data.length).fill(''));
            } catch (err) {
                console.error('Failed to fetch questions:', err);
            }
        };
        fetchQuestions();
    }, [token]);

    useEffect(() => {
        if (submitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    useEffect(() => {
        if (timeLeft === 0 && !submitted) {
            handleSubmitAnswers();
        }
    }, [timeLeft, submitted]);

    const handleOptionChange = (index, value) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[index] = value;
        setUserAnswers(updatedAnswers);
    };

    const handleSubmitAnswers = async () => {
        if (submitted) return;

        try {
            for (let i = 0; i < questions.length; i++) {
                const response = await axios.post(
                    'https://aptitude-ohar.onrender.com/api/user/answers',
                    {
                        questionId: questions[i]._id,
                        answer: userAnswers[i] ? userAnswers[i] : 'therila',
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

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className='dashboard' style={{ padding: 20 }}>
            <h1>Survey Questions</h1>
            {!submitted ? (
                <div>
                    <h3>Time Left: {formatTime(timeLeft)}</h3>
                    {questions.map((question, index) => (
                        <div key={index}>
                            <h2>{question.question}</h2>
                            <div>
                                {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex}>
                                        <input
                                            type="radio"
                                            id={`question${index}_option${optionIndex}`}
                                            name={`question${index}`}
                                            value={option}
                                            checked={userAnswers[index] === option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                        />
                                        <label htmlFor={`question${index}_option${optionIndex}`}>{option}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className='submit' onClick={handleSubmitAnswers}>Submit Answers</button>
                </div>
            ) : (
                <div>
                    <h2>Thanks for attending the exam.</h2>
                </div>
            )}
        </div>
    );
};

export default Questions;
