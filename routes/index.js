var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/newuser',function(req,res) {
	var resumes = [{name: 'Nitish', exp: '5', dob:'1998-10-13'}, {}];
    res.json(resumes);
});

router.post('/adduser', function(req, res){
	var db = req.db;
	var collection = db.get('resumes');
	collection.insert(req.body, function(err,doc) {
		if (err) {
			res.send("error in connecting to database");
		}
		else{
			res.json(doc);
		}
	});
});



module.exports = router;


