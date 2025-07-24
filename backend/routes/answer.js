const express = require('express');
const router = express.Router();
const Answer = require('../models/Answers');
const OriginalAnswer = require('../models/AdminAnswer');

// Submit user answer
router.post('/submit-answer', async (req, res) => {
  try {
    const { userId, questionId, answer } = req.body;

    const correctAnswer = await OriginalAnswer.findOne({ questionId });
    if (!correctAnswer) return res.status(404).json({ message: 'Correct answer not found.' });

    const isCorrect = correctAnswer.answer.trim().toLowerCase() === answer.trim().toLowerCase();

    const newAnswer = new Answer({ userId, questionId, answer, isCorrect });
    await newAnswer.save();

    res.status(201).json({ message: 'Answer submitted.', isCorrect });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
