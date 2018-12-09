const express = require('express');
const Question = require('../../models/question');
const Gongmo = require('../../models/gongmo');
const Answer = require('../../models/answer'); 
const LikeLog = require('../../models/like-log'); 
const GongmoLikeLog = require('../../models/gongmo-like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/questions', require('./questions'));
router.use('/gongmos', require('./gongmos'));

// Like for Question
router.post('/questions/:id/like', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next({status: 404, msg: 'Not exist question'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, question: question._id});
  if (!likeLog) {
    question.numLikes++;
    await Promise.all([
      question.save(),
      LikeLog.create({author: req.user._id, question: question._id})
    ]);
  }
  return res.json(question);
}));
// Like for Gongmo
router.post('/gongmos/:id/like', catchErrors(async (req, res, next) => {
  const gongmo = await Gongmo.findById(req.params.id);
  if (!gongmo) {
    return next({status: 404, msg: 'Not exist gongmo'});
  }
  var likeLog = await LikeLog.findOne({author: req.user._id, gongmo: gongmo._id});
  if (!likeLog) {
    gongmo.numLikes++;
    await Promise.all([
      gongmo.save(),
      LikeLog.create({author: req.user._id, gongmo: gongmo._id})
    ]);
  }
  return res.json(gongmo);
}));

// Like for Answer
router.post('/answers/:id/like', catchErrors(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  answer.numLikes++;
  await answer.save();
  return res.json(answer);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});


module.exports = router;