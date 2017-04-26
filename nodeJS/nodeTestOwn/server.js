var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/seed');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    var sid = req.param('sid');
    if(sid !== 'undefined' && sid) {
        var db = req.db;
        var collection = db.get('usercollection');
        collection.findOne({_id:sid},{},function (err, doc) {
            res.render('home', {
                "user": doc,
                title : 'Home'
            });
        });
    }
    else {
        res.redirect('/signin');
    }
});

app.get('/signin', function(req, res) {
    res.render("signin", { title: 'Signin!' });
});

/* POST to Signin Service */
app.post('/signin', function(req, res) {
    var db = req.db;
    var userName = req.param('username');
    var password = req.param('password');

    var collection = db.get('usercollection');

    collection.insert({
        "username" : userName,
        "password" : password
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            collection.findOne({"username":userName},function (err, doc) {
                res.redirect("/?sid=" + doc._id);
            });
        }
    });
});

/* GET New User page. */
app.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
app.post('/adduser', function(req, res) {
    var db = req.db;
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var collection = db.get('usercollection');
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.redirect("userlist");
        }
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
