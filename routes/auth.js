var mysql = require('./mysql');

function signin(req, res){
	var email, password;
	email = req.body.email;
	password = req.body.password;
	if(email !== '' &&  email !== undefined && password !== '' &&  password !== undefined) {
		var getUser="select * from user where email='" + email + "' and password='" + password +"'";
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				if(results.length > 0) {
					req.session.id = results[0].id;
					req.session.isValid = true;
					req.session.uname = results[0].first_name+" "+results[0].last_name;
					res.status(200).json({status:200,statusText:"Success"});
				} else {    
					res.status(401).json({status:401,statusText:"Login failed"});
				}
			}  
		},getUser);
	} else {
		res.status(400).json({status:400,statusText:"Validation failed"});
	}
}

function signup(req, res){
	var email, password, first_name, last_name;
	email = req.body.email;
	password = req.body.password;
	first_name = req.body.first_name;
	last_name = req.body.last_name;
	if(email !== '' &&  email !== undefined && password !== '' &&  password !== undefined 
		&& first_name !== '' && first_name !== undefined && last_name !== '' && last_name !== undefined) {
		// check user already exists
		var checkUser="select * from user where email='"+email+"'";
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				if(results.length > 0) {
					req.session.email = email;
					res.status(409).json({status:409,statusText:"User already exists"});
				} else {    
					var createUser = "insert into user (first_name,last_name,email,password,is_verified) " +
						"values ('"+first_name+"','"+last_name+"','"+email+"','"+password+"',true)";
					mysql.query(function(err,results){
						if(err){
							res.status(500).json({status:500,statusText: err.code});
						} else {
							req.session.id = results.insertId;
							req.session.isValid = true;
							req.session.uname = first_name+" "+last_name;
							res.status(200).json({status:200,statusText:"Success"});
						}  
					},createUser);
				}
			}  
		},checkUser);
	} else {
		res.status(400).json({status:400,statusText:"Validation failed"});
	}
}


function checkSession(req, res){
	if(req.session && req.session.isValid){
		res.status(200).json({status:200,statusText:"Success",data:{uname:req.session.uname}});
	} else {
		res.status(401).json({status:401,statusText:"Not active"});
	}
}

function logout(req,res){
	req.session.destroy();
	res.status(200).json({status:200,statusText:"Success"});
}

exports.signin = signin;
exports.signup = signup;
exports.checkSession = checkSession;
exports.logout = logout;
