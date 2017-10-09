var mysql = require('./mysql');

function updateUserProfile(req,res){
	if(req.session.isValid){
		if(req.body.first_name !== undefined && req.body.first_name !== null && req.body.last_name !== undefined && req.body.last_name !== null) {
			var updateUser = "update user set first_name='"+req.body.first_name+"', last_name='"+req.body.last_name+"', "+
			"about='"+req.body.about+"', education='"+req.body.education+"', occupation='"+req.body.occupation+"', contact_no='"+req.body.contact_no+"' "+
			"where id="+req.session.id;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success"});
				}  
			},updateUser);
		} else {
			res.status(400).json({status:400,statusText:"Required fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function getUserProfile(req,res){
	if(req.session.isValid){
		var getUser = "select first_name, last_name, email, about, education, occupation, contact_no from user where id="+req.session.id;
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				res.status(200).json({status:200,statusText:"Success",data:results[0]});
			}  
		},getUser);
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

exports.updateUserProfile = updateUserProfile;
exports.getUserProfile = getUserProfile;