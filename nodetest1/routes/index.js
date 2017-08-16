var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://trustuslife:india123@ourbackend-shard-00-00-rcuwr.mongodb.net:27017,ourbackend-shard-00-01-rcuwr.mongodb.net:27017,ourbackend-shard-00-02-rcuwr.mongodb.net:27017/UserInfo?ssl=true&replicaSet=OurBackend-shard-0&authSource=admin";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET New Info page. */
router.get('/newinfo', function(req, res) {
    res.render('newinfo', { title: 'Add New Info' });
});

/*GET Sign Up page*/
router.get('/signup', function(req, res) {
    res.render('signup', { title: 'Add New User' });
});

/*GET Log In page*/
router.get('/login', function(req, res){
	res.render('login', {title: 'Enter your details'});
});

/* GET information page. */
 router.get('/information', function(req, res) {
		var db = req.db;
		//var collection = db.get('Info');
		db.collection('Info').find({},{},function(e,docs){
			res.render('information', {
				"information" : docs
			}); 
		}); 
	
 });

/* POST to Add Info Service */
router.post('/addinfo', function(req, res) {

    // Set our internal DB variable
    var deb = req.db;

    // Get our form values. These rely on the "name" attributes
    var website = req.body.website;
	var userName = req.body.username;
    var passwd = req.body.passwd;

    // Set our collection
    //var collection = db.get('Info');

    // Submit to the DB
    db.collection('Info').insert({
        "website" : website,
		"username" : userName,
        "password" : passwd
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("information");
        }
    });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
    var passwd = req.body.passwd;
	
	db.collection('Users').findOne({"email" : email}, function(result){
		if(null!=result){
			console.log("USERNAME WITH THIS EMAIL ALREADY EXISTS:", result.username);
			res.redirect("signup");
		}
		else{
			var hash=bcrypt.hashSync(passwd, 8);
			db.collection('Users').insert({
				"email" : website,
				"password" : passwd,
				"firstname" : firstname,
				"lastname" : lastname
			}, function (err, doc) {
				if (err) {
					// If it failed, return error
					res.send("There was a problem creating the account. Please try again later.");
				}
			else {
				// And forward to success page
				res.redirect("information");
			}
			});
		}
	}    
});

/* POST to Log In service*/
router.post('/loginverify', function(req, res){
	var db=req.db;
	var email=req.body.email;
	var passwd=req.body.passwd;
	var hash=bcrypt.hashSync(passwd, 8);
	
	db.collection('Users').findOne({"email" : email}, function(result){
		if(null!= result){
			if(hash==result.passwd){
				console.log("LOGIN SUCCESS FOR:", email);
				app.use(function(req,res,next){
					req.user = email;
					next();
				});
				res.redirect("information");
			}
			else
		}
	});
});

module.exports = router;
