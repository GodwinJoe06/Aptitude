const express = require('express');
const Answers = require('../models/Answers');
const { Parser } = require('json2csv');
const AdminAnswers = require('../models/AdminAnswer');
const User = require('../models/User');
const Ques = require('../models/Ques');

const router = express.Router();

router.get('/results/download', async (req, res) => {
  try {
    const userAnswers = await Answers.find({});
    const adminAnswers = await AdminAnswers.find({});
    const users = await User.find({});

    const correctAnswerMap = {};
    adminAnswers.forEach(ans => {
      correctAnswerMap[ans.questionId.toString()] = ans.answer;
    });

    const userNameMap = {};
    users.forEach(user => {
      userNameMap[user._id.toString()] = user.name;
    });

    const scoreMap = {};
    userAnswers.forEach(ans => {
      const userId = ans.userId.toString();
      const correctAnswer = correctAnswerMap[ans.questionId.toString()];
      const isCorrect = ans.answer === correctAnswer;

      if (!scoreMap[userId]) {
        scoreMap[userId] = {
          Name: userNameMap[userId] || 'Unknown',
          Score: 0,
          Batch : users.find(user => user._id.toString() === userId)?.batch || 'Unknown'
        };
      }

      if (isCorrect) scoreMap[userId].Score++;
    });

    const csvData = Object.values(scoreMap);
    const parser = new Parser({ fields: ['Name', 'Score' , 'Batch'] });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('user-assessment-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV generation error:', error);
    res.status(500).send('Error generating CSV report.');
  }
});


router.get('/results', async (req, res) => {
  try {
    const allUserAnswers = await Answers.find({});
    const allAdminAnswers = await AdminAnswers.find({});
    const allQuestions = await Ques.find({}); 

    const adminAnswerMap = {};
    allAdminAnswers.forEach(ans => {
      adminAnswerMap[ans.questionId] = ans.answer;
    });

    const questionMap = {};
    allQuestions.forEach(q => {
      questionMap[q._id.toString()] = q.question;
    });

    const users = await User.find({});
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.name;
    });

    const result = {};

    allUserAnswers.forEach(ans => {
      const userId = ans.userId.toString();
      if (!result[userId]) {
        result[userId] = {
          name: userMap[userId] || 'Unknown',
          answers: [],
          score: 0,
        };
      }

      const correctAnswer = adminAnswerMap[ans.questionId];
      const isCorrect = correctAnswer === ans.answer;

      if (isCorrect) result[userId].score++;

      result[userId].answers.push({
        question: questionMap[ans.questionId.toString()] || 'Unknown',
        userAnswer: ans.answer,
        adminAnswer: correctAnswer,
        isCorrect,
      });
    });

    res.json(Object.values(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
