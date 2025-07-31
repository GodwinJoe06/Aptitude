const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Question = require('../models/Ques');
const AdminAnswers = require('../models/AdminAnswer');
const Answer = require('../models/Answers');
const Attended = require('../models/Answered');
const Ques = require('../models/Ques');
const User = require('../models/User');
const limitDailyAttempt = require('../middleware/limitDailyAttempt');
const router = express.Router();

router.post('/answers', auth,limitDailyAttempt, async (req, res) => {
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
    const alreadyExists = await Attended.exists({ userId });
    if (!alreadyExists) {
      await Attended.create({
        userId,
        alreadyAttended: true,
      });
    }


    res.json({ msg: 'Answer submitted successfully', isCorrect });
  } catch (err) {
    console.error('Answer Submission Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.get('/results', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ msg: 'userId is required in query params' });
    }

    // ✅ Fetch only answers of the requested user
    const userAnswers = await Answer.find({ userId }).populate('questionId', 'question');
    if (!userAnswers || userAnswers.length === 0) {
      return res.status(404).json({ msg: 'No answers found for this user' });
    }

    // Fetch correct answers from admin
    const allAdminAnswers = await AdminAnswers.find({});
    const allQuestions = await Ques.find({});
    const user = await User.findById(userId);

    // Map questionId to correct answer
    const adminAnswerMap = {};
    allAdminAnswers.forEach(ans => {
      adminAnswerMap[ans.questionId.toString()] = ans.answer;
    });

    // Map questionId to question text
    const questionMap = {};
    allQuestions.forEach(q => {
      questionMap[q._id.toString()] = q.question;
    });

    // ✅ Build result only for that user
    const result = {
      userId,
      name: user?.name || 'Unknown',
      score: 0,
      total: userAnswers.length,
      answers: []
    };

    userAnswers.forEach(ans => {
      const qid = ans.questionId._id.toString();
      const correctAnswer = adminAnswerMap[qid];
      const isCorrect = ans.answer === correctAnswer;

      if (isCorrect) result.score++;

      result.answers.push({
        question: questionMap[qid] || 'Unknown',
        userAnswer: ans.answer,
        correctAnswer: correctAnswer || 'Not provided',
        isCorrect
      });
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching user result:', err);
    res.status(500).json({ msg: 'Server error' });
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
