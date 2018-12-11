const express = require('express');
const Gongmo = require('../../models/gongmo'); 
const Comment = require('../../models/comment'); 
const LikeLog = require('../../models/like-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/gongmos', require('./gongmos'));

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

// Like for Comment
router.post('/comments/:id/like', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numLikes++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;
