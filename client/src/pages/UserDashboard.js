import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const token = localStorage.getItem('token'); // assuming token is saved on login

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

    const handleOptionChange = (index, value) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[index] = value;
        setUserAnswers(updatedAnswers);
    };

    const handleSubmitAnswers = async () => {
        if (submitted) return; // prevent double submission

        let tempScore = 0;

        try {
            for (let i = 0; i < questions.length; i++) {
                const response = await axios.post(
                    'https://aptitude-ohar.onrender.com/api/user/answers',
                    {
                        questionId: questions[i]._id,
                        answer: userAnswers[i],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.isCorrect) {
                    tempScore += 1;
                }
            }

            setScore(tempScore);
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting answers:', err);
        }
    };

    return (
        <div>
            <h1>Survey Questions</h1>
            {!submitted ? (
                <div>
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
                    <button onClick={handleSubmitAnswers}>Submit Answers</button>
                </div>
            ) : (
                <div>
                    <h2>Your Final Score: {score} out of {questions.length}</h2>
                </div>
            )}
        </div>
    );
};

export default Questions;
