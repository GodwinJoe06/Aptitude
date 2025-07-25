const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Question = require('../models/Ques');
const Answer = require('../models/Answers')

const router = express.Router();

router.post('/answers', auth, async (req, res) => {
  const userId = req.user.id;
  const { questionId, answer } = req.body;
  console.log('Received answer:', { userId, questionId, answer });

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === answer;

    const userAnswer = new Answer({
      userId,
      questionId,
      answer,
      isCorrect,
    });

    await userAnswer.save();

    res.json({ msg: 'Answer submitted successfully', isCorrect });
  } catch (err) {
    console.error('Answer Submission Error:', err.message);
    res.status(500).send('Server error');
  }
});


router.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find(); 
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
