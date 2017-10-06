var mysql = require('./mysql');
var moment = require('moment');

function addAsset(req, res){
	if(req.session.isValid){
		if(req.body.is_directory === 'false'){
			if(req.file !== undefined && req.file !== null) {
				var searchDup="select count(*) as count from asset where original_name='"+req.file.originalname+"'";
				mysql.query(function(err,results){
					if(err) {
						res.status(500).json({status:500,statusText: err.code});
					} else {
						//changing duplicate file name
						var new_filename = req.file.originalname;
						if(results[0].count > 0){
							new_filename = [new_filename.slice(0, new_filename.lastIndexOf('.')), "(", results[0].count, ")", new_filename.slice(new_filename.lastIndexOf('.'))].join('');
						}
						if(req.body.parent !== undefined && req.body.parent !== null){
							var getParent="select * from asset where name='"+req.body.parent+"'";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results.length > 0) {
										var newAsset = "insert into asset (is_directory,is_deleted,created_date,metadata,name,original_name,parent,owner) " +
											"values (false,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+JSON.stringify(req.file)+"','"+new_filename+"','"+req.file.originalname+"',"+results[0].id+","+req.session.id+")";
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},newAsset);
									} else {   
										res.status(400).json({status:400,statusText:"Parent does not exist"});
									}
								}  
							},getParent);
						} else {
							var newAsset = "insert into asset (is_directory,is_deleted,created_date,metadata,name,original_name,owner) " +
								"values (false,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+JSON.stringify(req.file)+"','"+new_filename+"','"+req.file.originalname+"',"+req.session.id+")";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
								}  
							},newAsset);
						}
					}
				},searchDup);
			} else {
				res.status(400).json({status:400,statusText:"Bad request"});
			}
		} else if(req.body.is_directory === 'true'){
			if(req.body.name !== undefined && req.body.name !== null) {
				var searchDup="select count(*) as count from asset where original_name='"+req.body.name+"'";
				mysql.query(function(err,results){
					if(err) {
						res.status(500).json({status:500,statusText: err.code});
					} else {
						//changing duplicate folder name
						var new_filename = req.body.name;
						if(results[0].count > 0){
							new_filename = [new_filename, "(", results[0].count, ")"].join('');
						}
						if(req.body.parent !== undefined && req.body.parent !== null){
							var getParent="select * from asset where name='"+req.body.parent+"'";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results.length > 0) {
										var newAsset = "insert into asset (is_directory,is_deleted,created_date,name,original_name,parent,owner) " +
											"values (true,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+new_filename+"','"+req.body.name+"',"+results[0].id+","+req.session.id+")";
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},newAsset);
									} else {   
										res.status(400).json({status:400,statusText:"Parent does not exist"});
									}
								}  
							},getParent);
						} else {
							var newAsset = "insert into asset (is_directory,is_deleted,created_date,name,original_name,owner) " +
								"values (true,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+new_filename+"','"+req.body.name+"',"+req.session.id+")";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
								}  
							},newAsset);
						}
					}
				},searchDup);
			} else {
				res.status(400).json({status:400,statusText:"Bad request"});
			}
		} else {
			res.status(400).json({status:400,statusText:"Bad request"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function getAssets(req, res){
	if(req.session.isValid){
		if(req.body.starred){
			//get all current user starred assets
			var getAssets = "select a.*, true as is_starred, if(a.owner="+req.session.id+",true,false) as can_delete from asset as a "+
							"inner join user_asset_starred as uas "+
							"on a.id= uas.asset "+
							"where uas.user="+req.session.id+" and a.is_deleted=false";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}  
			},getAssets);
		} else if(req.body.recent){
			//get current user recent assets
			var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete from "+
							"(select * from asset where owner="+req.session.id+" and parent is null and is_deleted=false "+
							"union "+
							"select a.* from asset as a "+
							"inner join user_asset_shared as uas "+
							"on a.id= uas.asset "+
							"where a.parent is null and uas.user="+req.session.id+" and a.is_deleted=false) result "+
							"left join user_asset_starred as uast on result.id=uast.asset "+
							"order by created_date desc limit 10";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}  
			},getAssets);
		} else if(req.body.parent !== undefined && req.body.parent !== null){
			var getParent="select * from asset where name='"+req.body.parent+"'";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0) {
						var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete from "+
							"(select * from asset where owner="+req.session.id+" and parent="+results[0].id+" and is_deleted=false "+
							"union "+
							"select a.* from asset as a "+
							"inner join user_asset_shared as uas "+
							"on a.id= uas.asset "+
							"where a.parent="+results[0].id+" and uas.user="+req.session.id+" and a.is_deleted=false) result "+
							"left join user_asset_starred as uast on result.id=uast.asset";
						mysql.query(function(err,results){
							if(err){
								res.status(500).json({status:500,statusText: err.code});
							} else {
								res.status(200).json({status:200,statusText:"Success",data:results});
							}  
						},getAssets);
					} else {   
						res.status(400).json({status:400,statusText:"Parent does not exist"});
					}
				}  
			},getParent);
		} else {
			var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete from "+
							"(select * from asset where owner="+req.session.id+" and parent is null and is_deleted=false "+
							"union "+
							"select a.* from asset as a "+
							"inner join user_asset_shared as uas "+
							"on a.id= uas.asset "+
							"where a.parent is null and uas.user="+req.session.id+" and a.is_deleted=false) result "+
							"left join user_asset_starred as uast on result.id=uast.asset";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}  
			},getAssets);
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function deleteAsset(req,res){
	if(req.session.isValid) {
		if(req.body.assetId !== undefined && req.body.assetId !== null) {
			var getAsset="select * from asset where id="+req.body.assetId;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0) {
						if(results[0].owner === req.session.id) {
							var deleteAsset = "update asset set is_deleted=true where id="+req.body.assetId;
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success"});
									//TODO: if folder, delete containing files/folders
								}  
							},deleteAsset);
						} else {
							res.status(401).json({status:401,statusText:"Not authorized"});
						}
					} else {   
						res.status(400).json({status:400,statusText:"Asset does not exist"});
					}
				}  
			},getAsset);
		} else {
			res.status(400).json({status:400,statusText:"Bad request"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function addOrRemoveStarredAsset(req,res){
	if(req.session.isValid) {
		if(req.body.assetId !== undefined && req.body.assetId !== null && req.body.isStarred !== undefined && req.body.isStarred !== null) {
			var getAsset="select * from asset where id="+req.body.assetId;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0) {
						var checkAlreadyStarred = "select * from user_asset_starred where user="+req.session.id+" and asset="+req.body.assetId;
						mysql.query(function(err,results){
							if(err){
								res.status(500).json({status:500,statusText: err.code});
							} else {
								if(results.length > 0){
									if(req.body.isStarred) {
										res.status(400).json({status:400,statusText:"Asset already added to starred"});
									} else {
										//remove from starred
										var removeFromStarred = "delete from user_asset_starred where user="+req.session.id+" and asset="+req.body.assetId;
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},removeFromStarred);
									}
								} else {
									if(req.body.isStarred) {
										//add to starred
										var addToStarred = "insert into user_asset_starred (user,asset) values ("+req.session.id+","+req.body.assetId+")";
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},addToStarred);
									} else {
										res.status(400).json({status:400,statusText:"Asset not found in starred"});
									}
								}
							}  
						},checkAlreadyStarred);
					} else {   
						res.status(400).json({status:400,statusText:"Asset does not exist"});
					}
				}  
			},getAsset);
		} else {
			res.status(400).json({status:400,statusText:"Bad request"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

exports.addAsset = addAsset;
exports.getAssets = getAssets;
exports.deleteAsset = deleteAsset;
exports.addOrRemoveStarredAsset = addOrRemoveStarredAsset;