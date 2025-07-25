const Answer = require('../models/Answers');

const MAX_ANSWERS_PER_DAY = 5; 

module.exports = async function limitDailyAttempt(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayCount = await Answer.countDocuments({
      userId,
      createdAt: { $gte: start, $lt: end }
    });

    if (todayCount >= MAX_ANSWERS_PER_DAY) {
      return res
        .status(429)
        .json({ message: `You can take only one test (${MAX_ANSWERS_PER_DAY} questions) per day. Try again tomorrow.` });
    }

    return next();
  } catch (err) {
    console.error('limitDailyAttempt error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};