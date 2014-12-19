var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/list', function(req, res) {
	// console.log(req)
  var db = req.db;
  db.get('resumes').find({},{},function(e,docs){
  	res.json(docs);
});
});

router.get('/search/:term', function(req, res) {
  var db = req.db;
  var term = req.params.term;
  console.log(term);


  var nameRegEx = /^[a-zA-Z]+$/;
  var emailRegEx = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
  var numberRegEx = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
  
  var type = 'name';


  // console.log(emailRegEx.exec(term));
  console.log(numberRegEx.test(term));
  if(emailRegEx.exec(term))
  	type = 'email';
  else if(numberRegEx.exec(term))
  	type = 'mobile';

  	var cb = function(e, docs){
  		// console.log(docs);
		if(!e){
			// console.log(docs);
			res.json(docs);
			// console.log(docs);

		}else{
			res.json(500, 'Error. Please try after some time');
		}
	};

	console.log(type);

  	if(type == 'email'){
		db.get('resumes').find({"emailaddress": term}, {}, cb);
	}else if(type == 'mobile'){
		db.get('resumes').find({"mobile": term}, {}, cb);
	}else{
		db.get('resumes').find({"name":new RegExp('^'+term,'i')}, {}, cb);
	}
  
});


router.post('/add', function(req, res){

	var nameRegEx = /^[a-zA-Z]+$/;
	var emailRegEx = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
	var numberRegEx = /^((0091)|(\+91)|0?)[789]{1}\d{9}$/;



	console.log(nameRegEx.test(req.body.name));
	console.log(emailRegEx.test(req.body.emailaddress));
	console.log(numberRegEx.test(req.body.mobile));




	if(nameRegEx.test(req.body.name) && emailRegEx.test(req.body.emailaddress) && numberRegEx.test(req.body.mobile)){
		var db = req.db;
		var collection = db.get('resumes');
		collection.find({"emailaddress":req.body.emailaddress}, {}, function(e, resumes) {
			if(!e){
				if(resumes && resumes.length > 0){
					res.json(400, 'Resume with this email already exists. Please edit the existing resume');
				}else{
					var document = req.body.document;
					delete req.body['document'];

					var rand = Math.floor(Math.random() * 90000) + 10000;
					var matches = document.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
					var base64Data = matches[2];
					var index = document.indexOf("pdf");
					console.log(index);
					// var index1 = document.indexOf("doc");
					// console.log(index1);
					var index2 = document.indexOf("docx");
					console.log(index2);

					// var hed = document[11];
					var ext = document.substr(11, 3);
					console.log(ext);
					// var ext1 = document.substr(11, 3);
					// console.log(ext1)
					var ext2 = document.substr(11, 4);
					console.log(ext2);
					//pdf
					if(ext == "pdf"){
						req.body.document = rand + "." +ext;
					}else if(ext2 == "docx"){
						req.body.document = rand + "." +ext2;
					}else{
						res.json({msg:"Please select a valid format"});
					}
					// req.body.document = rand + "."+ext2;
					console.log(req.body.document);
					collection.insert(req.body, {}, function(e, newlyAddedResume){
						if(!e){
							
						    var buffer = new Buffer(base64Data, 'base64');
						    fs.writeFile('/Users/nitish/Documents/'+req.body.document, buffer, function(){
						      	res.json(newlyAddedResume);
						    });
						}
					});
				}
			}else{
				res.status(500).json(e);
			}
		});
	}else{
		res.status(500).json(e);
	}

});



router.put('/edit/:id', function(req, res, next) {
	var db = req.db;
	var collection = db.get('resumes');
  	collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, resume){
    if (e) return next(e)
    res.send((resume===1)?{msg:'success'}:{msg:'error'})
  	});
});


router.delete('/delete/:id', function(req, res, next) {
	var db = req.db;
	var uid = req.params.id.toString();
	var collection = db.get('resumes');
	console.log(collection)
	console.log(collection.find({"_id" : uid}));
	collection.remove({"_id":uid}, function(e, resumes){
		console.log(resumes);
    	if (e) 
    		return next(e)
    	else 
    		res.json({msg:'success'})
  	});

});
module.exports = router;


