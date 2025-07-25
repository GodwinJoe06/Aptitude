const mongoose = require('mongoose');
const Question = require('./models/Ques');
const Answer = require('./models/AdminAnswer');
require('dotenv').config();

const seedDatabase = async () => {
  const questionsData = [
    {
      question: "Which animal is known as the 'Ship of the Desert?",
      options: ["Deer", "Tiger", "Camel", "Lion"],
    },
    {
      question: "Name the National bird of India?",
      options: ["Dog", "Cat", "Bird", "Peacock"],
    },
    {
      question: "What is your favorite food?",
      options: ["Pizza", "Sushi", "Burger", "Salad"],
    },
    {
      question: "Which season do you prefer?",
      options: ["Spring", "Summer", "Fall", "Winter"],
    },
    {
      question: "What is your favorite hobby?",
      options: ["Reading", "Traveling", "Gaming", "Cooking"],
    },
  ];

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    await Question.deleteMany({});
    await Answer.deleteMany({});

    const savedQuestions = await Question.insertMany(questionsData);

    const answersData = [
      {
        questionId: savedQuestions[0]._id,
        answer: "Camel",
        isCorrect: true,
      },
      {
        questionId: savedQuestions[1]._id,
        answer: "Peacock",
        isCorrect: true,
      },
      {
        questionId: savedQuestions[2]._id,
        answer: "Pizza",
        isCorrect: true,
      },
      {
        questionId: savedQuestions[3]._id,
        answer: "Summer",
        isCorrect: true,
      },
      {
        questionId: savedQuestions[4]._id,
        answer: "Reading",
        isCorrect: true,
      },
    ];

    await Answer.insertMany(answersData);
    console.log('Seeded correct answers!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();