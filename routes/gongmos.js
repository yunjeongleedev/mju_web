const express = require('express');
const Gongmo = require('../models/gongmo');
const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');


module.exports = io => {
  const router = express.Router();
  
  // 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
  function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
  }

  /* GET gongmos listing. */
  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {};
    const term = req.query.term;
    if (term) {
      query = {$or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {manager: {'$regex': term, '$options': 'i'}},
        {imgURL: {'$regex': term, '$options': 'i'}}
      ]};
    }
    const gongmos = await Gongmo.paginate(query, {
      sort: {createdAt: -1}, 
      populate: 'author', 
      page: page, limit: limit
    });
    res.render('gongmos/index', {gongmos: gongmos, term: term, query: req.query});
  }));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('gongmos/new', {gongmo: {}});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const gongmo = await Gongmo.findById(req.params.id);
    res.render('gongmos/edit', {gongmo: gongmo});
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const gongmo = await Gongmo.findById(req.params.id).populate('author');
    const comments = await Comment.find({gongmo: gongmo.id}).populate('author');
    gongmo.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await gongmo.save();
    res.render('gongmos/show', {gongmo: gongmo, comments: comments});
  }));

  router.put('/:id', catchErrors(async (req, res, next) => {
    const gongmo = await Gongmo.findById(req.params.id);

    if (!gongmo) {
      req.flash('danger', 'Not exist gongmo');
      return res.redirect('back');
    }
    gongmo.title = req.body.title;
    gongmo.content = req.body.content;
    gongmo.manager = req.body.manager;
    gongmo.imgURL = req.body.imgURL;
    gongmo.startDate = req.body.startDate;
    gongmo.endDate = req.body.endDate;
    gongmo.tags = req.body.tags.split(" ").map(e => e.trim());

    await gongmo.save();
    req.flash('success', 'Successfully updated');
    res.redirect('/gongmos');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Gongmo.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/gongmos');
  }));

  router.post('/', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    var gongmo = new Gongmo({
      title: req.body.title,
      author: user._id,
      content: req.body.content,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      manager: req.body.manager,
      imgURL: req.body.imgURL,
      tags: req.body.tags.split(" ").map(e => e.trim()),
    });
    await gongmo.save();
    req.flash('success', 'Successfully posted');
    res.redirect('/gongmos');
  }));

  router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const gongmo = await Gongmo.findById(req.params.id);

    if (!gongmo) {
      req.flash('danger', 'Not exist gongmo');
      return res.redirect('back');
    }

    var comment = new Comment({
      author: user._id,
      gongmo: gongmo._id,
      content: req.body.content,
    });
    await comment.save();
    gongmo.numComments++;
    await gongmo.save();

    const url = `/gongmos/${gongmo._id}#${comment._id}`;
    io.to(gongmo.author.toString())
      .emit('commented', {url: url, gongmo: gongmo});
    console.log('SOCKET EMIT', gongmo.author.toString(), 'commented', {url: url, gongmo: gongmo})
    req.flash('success', 'Successfully commented');
    res.redirect(`/gongmos/${req.params.id}`);
  }));

  return router;
}