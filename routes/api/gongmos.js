const express = require('express');
const Gongmo = require('../../models/gongmo');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const gongmos = await Gongmo.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({gongmos: gongmos.docs, page: gongmos.page, pages: gongmos.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const gongmo = await Gongmo.findById(req.params.id).populate('author');
  res.json(gongmo);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var gongmo = new Gongmo({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await gongmo.save();
  res.json(gongmo)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const gongmo = await Gongmo.findById(req.params.id);
  if (!gongmo) {
    return next({status: 404, msg: 'Not exist gongmo'});
  }
  if (gongmo.author && gongmo.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  gongmo.title = req.body.title;
  gongmo.content = req.body.content;
  gongmo.tags = req.body.tags;
  await gongmo.save();
  res.json(gongmo);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const gongmo = await Gongmo.findById(req.params.id);
  if (!gongmo) {
    return next({status: 404, msg: 'Not exist gongmo'});
  }
  if (gongmo.author && gongmo.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Gongmo.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));


module.exports = router;