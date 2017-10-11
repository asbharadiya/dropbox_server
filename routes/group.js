var mysql = require('./mysql');
var moment = require('moment');

function createGroup(req,res){
	if(req.session.isValid){
		if(req.body.name !== undefined && req.body.name !== null) {
			var newGroup = "insert into groups (name,owner,created_date) "+
			"values ('"+req.body.name+"',"+req.session.id+",'"+moment().format('YYYY-MM-DD HH:mm:ss')+"')";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success"});
				}  
			},newGroup);
		} else {
			res.status(400).json({status:400,statusText:"All fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function updateGroup(req,res){
	if(req.session.isValid){
		if(req.body.name !== undefined && req.body.name !== null && req.body.groupId !== undefined && req.body.groupId !== null) {
			var updateGroup = "update groups set name='"+req.body.name+"' where id="+req.body.groupId;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success"});
				}  
			},updateGroup);
		} else {
			res.status(400).json({status:400,statusText:"All fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function addRemoveMemberGroup(req,res){
	if(req.session.isValid){
		if(req.body.action !== undefined && req.body.action !== null 
			&& req.body.groupId !== undefined && req.body.groupId !== null
			&& req.body.memberId !== undefined && req.body.memberId !== null) {
			if(req.body.action === 'ADD'){
				//check if already added
				var checkAdded = "select count(*) from user_groups where user="+req.body.memberId+" and groups="+req.body.groupId;
				mysql.query(function(err,results){
					if(err){
						res.status(500).json({status:500,statusText: err.code});
					} else {
						if(results[0].count > 0){
							res.status(400).json({status:400,statusText:"Already added to group"});
						} else {
							//add to group
							var addMember = "insert into user_groups (user, groups) values ("+req.body.memberId+","+req.body.groupId+")";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
								}  
							},addMember);
						}
					}  
				},checkAdded); 
			} else {
				var checkAdded = "select count(*) from user_groups where user="+req.body.memberId+" and groups="+req.body.groupId;
				mysql.query(function(err,results){
					if(err){
						res.status(500).json({status:500,statusText: err.code});
					} else {
						if(results[0].count === 0){
							res.status(400).json({status:400,statusText:"Member not found in group"});
						} else {
							//remove from group
							var removeMember = "delete from user_groups where user="+req.body.memberId+" and groups="+req.body.groupId;
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
								}  
							},removeMember);
						}
					}  
				},checkAdded); 
			}
		} else {
			res.status(400).json({status:400,statusText:"All fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function deleteGroup(req,res){
	if(req.session.isValid){
		if(req.body.groupId !== undefined && req.body.groupId !== null) {
			var getGroup = "select id, owner from groups where id="+req.body.groupId;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0){
						if(results[0].owner === req.session.id) {
							var deleteGroup = "delete from groups where id="+req.body.groupId;
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
								}  
							},deleteGroup);
						} else {
							res.status(401).json({status:401,statusText:"Not authorized"});
						}
					} else {
						res.status(400).json({status:400,statusText:"Group not found"});
					}
				}  
			},getGroup);
		} else {
			res.status(400).json({status:400,statusText:"All fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function getGroupById(req,res){
	if(req.session.isValid){
		if(req.query.id !== undefined && req.query.id !== null) {
			var getGroupById="select id, name, created_date from groups where id="+req.query.id;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0) {
						var getUsers = "select id, concat(first_name,' ',last_name) as user_name, email from user "+
							"inner join "+
							"user_groups "+
							"on user_groups.user=user.id "+
							"where user_groups.groups="+req.query.id;
						mysql.query(function(err,results2){
							if(err){
								res.status(500).json({status:500,statusText: err.code});
							} else {
								res.status(200).json({status:200,statusText:"Success",data:{group:results[0],members:results2}});
							}  
						},getUsers);
					} else {
						res.status(400).json({status:400,statusText:"Group not found"});
					}
				}  
			},getGroupById);
		} else {
			res.status(400).json({status:400,statusText:"All fields not provided"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function getGroups(req,res){
	if(req.session.isValid){
		var getGroups="select id, name, true as can_delete from groups where owner="+req.session.id+" "+
			"union "+
			"select g.id, g.name, false as can_delete from groups as g "+
			"inner join "+
			"user_groups as ug "+
			"on g.id=ug.groups "+
			"where ug.user="+req.session.id;
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				if(results.length > 0) {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}
			}  
		},getGroups);
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function searchGroups(req,res){
	if(req.session.isValid){
		var searchGroups="select id, name, true as can_delete from groups where name like '%"+req.query.q+"%' and owner="+req.session.id+" "+
			"union "+
			"select g.id, g.name, false as can_delete from groups as g "+
			"inner join "+
			"user_groups as ug "+
			"on g.id=ug.groups "+
			"where ug.user="+req.session.id;
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				if(results.length > 0) {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}
			}  
		},searchGroups);
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function searchUsers(req,res){
	if(req.session.isValid){
		var searchUsers="select id, concat(first_name,' ',last_name) as user_name, email from user "+
			"where (first_name like '%"+req.query.q+"%' or last_name like '%"+req.query.q+"%' or email like '%"+req.query.q+"%') and id <> "+req.session.id;
		mysql.query(function(err,results){
			if(err){
				res.status(500).json({status:500,statusText: err.code});
			} else {
				if(results.length > 0) {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}
			}  
		},searchUsers);
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

exports.createGroup = createGroup;
exports.updateGroup = updateGroup;
exports.addRemoveMemberGroup = addRemoveMemberGroup;
exports.deleteGroup = deleteGroup;
exports.getGroupById = getGroupById;
exports.getGroups = getGroups;
exports.searchGroups = searchGroups;
exports.searchUsers = searchUsers;