var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


// Add a Category
router.get('/add', function(req, res, next) {
  res.render('add-category', {
    title: 'Add Category'
  });
});

router.post('/add', function(req, res, next) {
  // Get form values
  var title = req.body.title;

  // Validate form
  req.checkBody('title', 'Category title is required').notEmpty();

  //Check for errors
  var errors = req.validationErrors();
  if (errors) {
    res.render('add-category', {
      errors: errors,
    });
  } else {
    var categories = db.get('categories');
    categories.insert({
      'title': title
    }, function(err, categories) {
      if(err) {
        res.send('There was an issue saving the category')
        console.log(err);
        res.end();
      } else {
        req.flash({'success': 'Category submitted'});
        res.location('/');
        res.redirect('/');
      }
    })
  }

})

module.exports = router;
