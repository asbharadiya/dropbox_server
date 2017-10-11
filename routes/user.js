var mysql = require('./mysql');
var moment = require('moment');

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
					addUserActivity(req.session.id,"Profile updated",function(activity_res){
						res.status(200).json({status:200,statusText:"Success"});
					});
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

function getUserActivity(req,res){
	if(req.session.isValid){
		var getUserActivity = "select date(created_date) as date, action from user_activity where user="+req.session.id+" and created_date >= (curdate() - interval 1 month) order by date";
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				res.status(200).json({status:200,statusText:"Success",data:results});
			}  
		},getUserActivity);
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function addUserActivity(user,action,callback){
	var addActivity = "insert into user_activity (action, created_date, user) "+
		"values ('"+action+"', '"+moment().format('YYYY-MM-DD HH:mm:ss')+"', "+user+")";
	mysql.query(function(err,results){
		if(err){
			callback(false);
		} else {
			callback(true);
		}  
	},addActivity);
}

exports.updateUserProfile = updateUserProfile;
exports.getUserProfile = getUserProfile;
exports.addUserActivity = addUserActivity;
exports.getUserActivity = getUserActivity;