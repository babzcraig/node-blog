var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer  = require('multer');
var upload = multer({ dest: './public/images/uploads' });


router.get('/show/:id', function(req,res, next) {
  var posts = db.get('posts');
  posts.findById(req.params.id, function(err, post) {
    res.render('show', {
      'post': post
    });
  })
});



//
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  categories.find({}, function(err, categories) {
    if (err) throw err;
    res.render('add-post', {
      'title': 'Add Post',
      'categories': categories
    });
  })
});

router.post('/add', upload.single('mainImage'), function(req, res, next) {
  // Get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date_created = new Date();

  // Check for image fields
  if(req.file) {
    console.log('uploading file...');
    var mainImageOriginalName = req.file.originalname;
    var mainImageName = req.file.filename;
    var mainImageMime = req.file.mimetype;
    var mainImagePath = req.file.path;
    var mainImageSize = req.file.size;
  } else {
    // Set default image
    // var mainImageName = 'no-image.png';
  }

  // Form Validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('category', 'Category field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();
  req.checkBody('author', 'Author field is required').notEmpty();

  // Check for errors
  var errors = req.validationErrors();
  if (errors) {
    res.render('add-post', {
      errors: errors,
      title: title,
      category: category,
      body: body,
      author: author,
    });
  } else {
    var db = req.db;
    var posts = db.get('posts');
    posts.insert({
      'title': title,
      'body': body,
      'category': category,
      'date_created': date_created,
      'author': author,
      'mainImage': mainImageName
    }, function(err, posts) {
      if (err) {
        res.send('There was an issue submitting your post')
        console.log(err);
        res.end();
      } else {
        req.flash({'success': 'Post submitted'});
        res.location('/');
        res.redirect('/');
      }
    })
  }

});

router.post('/add-comment', upload.single('mainImage'), function(req, res, next) {
  // Get form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var date_created = new Date();


  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();
  req.checkBody('email', 'Email must be valid email').isEmail();
  req.checkBody('email', 'Email field is required').notEmpty();

  // Check for errors
  var errors = req.validationErrors();
  if (errors) {
    var posts = db.get('posts');
    posts.findById(postid, function(err, post) {
      res.render('show', {
        errors: errors,
        name: name,
        body: body,
        email: email,
        posts: posts,
      });
    })
  } else {
    var comment = {'name': name, email: email, body: body, date_created: date_created}

    var posts = db.get('posts')
    posts.update({
      "_id": postid,
    },{
      $push: {
        'comments': comment
      }
    },function(err, doc) {
      if (err) {
        throw err;
      } else {
        req.flash('success', 'Comment Added');
        res.location('/posts/show/'+postid);
        res.redirect('/posts/show/'+postid);
      }
    })
  }

});


module.exports = router;
