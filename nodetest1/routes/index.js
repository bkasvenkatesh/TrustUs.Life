var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://trustuslife:india123@ourbackend-shard-00-00-rcuwr.mongodb.net:27017,ourbackend-shard-00-01-rcuwr.mongodb.net:27017,ourbackend-shard-00-02-rcuwr.mongodb.net:27017/UserInfo?ssl=true&replicaSet=OurBackend-shard-0&authSource=admin";
var loggedUser;

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
    res.render('signup', { title: 'Register New User' });
});

/*GET Log In page*/
router.get('/login', function(req, res){
	res.render('login', {title: 'Enter your details'});
});
/*GET Log Out page*/
router.get('/logout', function(req, res){
	res.cookie('LoggedUser', "None");
	res.redirect("/");
});

/* GET information page. */
router.get('/information', function(req, res) {
	var loggedUser = req.cookies.LoggedUser;
	if(loggedUser=="None")
		res.redirect("login");
	MongoClient.connect(uri, function(err, db){
		//var db = req.db;
		var loggedUser = req.cookies.LoggedUser;
		db.collection('Info').find({"user" : loggedUser}).toArray(function(e,docs){
			res.render('information', {
				"information" : docs
			}); 
		}); 
	});
 });

 /* POST to Update Info Service */
router.post('/updateinfo', function(req, res) {
	var website = req.body.website;
	var userName = req.body.username;
	var passwd = req.body.passwd;
	var id = req.body.row_id;
	var ObjectId = require('mongodb').ObjectId;
	var o_id = new ObjectId(id);
	MongoClient.connect(uri, function(err, db){
		db.collection('Info').updateOne({"_id" : o_id}, {
			$set:{
				"website" : website,
				"username" : userName,
				"password" : passwd
			}
		});
		db.close();
	});
	res.redirect('information');
});
	
/* POST to Edit Info page */
router.post('/editinfo', function(req, res) {
	var row_id=req.body.row;
	var ObjectId = require('mongodb').ObjectId;
	var o_id = new ObjectId(row_id);
	console.log(o_id);
	MongoClient.connect(uri, function(err, db){
		db.collection('Info').findOne({"_id" : o_id}, function(e, doc){
			console.log(doc);
			res.render('editinfo', {
				"row" : doc
			});
		});
		db.close();
	});
});
 
/* POST to Add Info Service */
router.post('/addinfo', function(req, res) {
	// Get our form values. These rely on the "name" attributes
	//var user= req.user;
	var website = req.body.website;
	var userName = req.body.username;
	var passwd = req.body.passwd;
	var loggedUser = req.cookies.LoggedUser

	MongoClient.connect(uri, function(err, db){
		// Submit to the DB
		db.collection('Info').insert({
			"user" : loggedUser,
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
		db.close();
	});
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
    var passwd = req.body.passwd;
	MongoClient.connect(uri, function(err, db){
		db.collection('Users').findOne({"email" : email}, function(err, result){
			if(result != null){
				console.log("USERNAME WITH THIS EMAIL ALREADY EXISTS:", result.email);
				res.redirect("signup");
			}
			else{
				
				var hash=bcrypt.hashSync(passwd, 8);
				db.collection('Users').insert({
					"email" : email,
					"password" : hash,
					"firstname" : firstname,
					"lastname" : lastname	
				}, function (err, doc) {
					if (err) {
						// If it failed, return error
						res.send("There was a problem creating the account. Please try again later.");
					}
					else {
						// And forward to success page
						res.redirect("login");
					}
				});
			}
		});
	});
});

/* POST to Log In service*/
router.post('/loginverify', function(req, res){
	var email=req.body.email;
	var passwd=req.body.passwd;
	MongoClient.connect(uri, function(err, db){
		db.collection('Users').findOne({"email" : email}, function(err, result){
			if(null != result){
				if(bcrypt.compareSync(passwd, result.password)){
					console.log("LOGIN SUCCESS FOR:", email);
					res.cookie('LoggedUser', email, { maxAge: 900000, httpOnly: true });
					res.redirect("information");
				}
				else{
					console.log(hash);
					console.log(result.password);
					res.send("Wrong password");
					
				}
			}
			else
				res.send("User does not exist");
		});
		db.close();
	});
});

module.exports = router;
