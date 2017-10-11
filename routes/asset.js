var mysql = require('./mysql');
var moment = require('moment');

function addAsset(req, res){
	if(req.session.isValid){
		if(req.body.is_directory === 'false'){
			if(req.file !== undefined && req.file !== null) {
				if(req.body.parent !== undefined && req.body.parent !== null && req.body.super_parent !== undefined && req.body.super_parent !== null) {
					var getSuperParent="select * from asset where name='"+req.body.super_parent+"' and owner="+req.session.id+" and is_deleted=false "+
						//from shared	
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"user_asset_shared as uas "+
						"on a.id=uas.asset "+
						"where uas.user="+req.session.id+" and a.name='"+req.body.super_parent+"' and is_deleted=false "+
						//from group shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"(select gas.* from (select * from groups where owner="+req.session.id+" "+
						"union "+
						"select groups.* from groups "+
						"inner join "+
						"user_groups "+
						"on groups.id=user_groups.groups "+
						"where user_groups.user="+req.session.id+") res "+
						"inner join "+
						"groups_asset_shared as gas "+
						"on res.id=gas.groups) res1 "+
						"on res1.asset=a.id "+
						"where a.name='"+req.body.super_parent+"' and a.is_deleted=false";
					mysql.query(function(err,results){
						if(err){
							res.status(500).json({status:500,statusText: err.code});
						} else {
							if(results.length > 0) {
								if(req.body.super_parent === req.body.parent) {
									//search for duplicate and not deleted
									var searchDup = "select count(*) from asset where original_name='"+req.file.originalname+"' and parent="+results[0].id+" and is_deleted=false";
									mysql.query(function(err,results2){
										if(err){
											res.status(500).json({status:500,statusText: err.code});
										} else {
											//changing duplicate folder name
											var new_filename = req.file.originalname;
											if(results2[0].count > 0){
												new_filename = [new_filename, "(", results2[0].count, ")"].join('');
											}
											var newAsset = "insert into asset (is_directory,is_deleted,created_date,metadata,name,original_name,parent,owner) " +
											"values (false,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+JSON.stringify(req.file)+"','"+new_filename+"','"+req.file.originalname+"',"+results[0].id+","+results[0].owner+")";
											mysql.query(function(err,results){
												if(err){
													res.status(500).json({status:500,statusText: err.code});
												} else {
													res.status(200).json({status:200,statusText:"Success"});
												}  
											},newAsset);
										}  
									},searchDup);
								} else {
									var getParent = "select id from asset where name='"+req.body.parent+"' and owner="+results[0].owner+" and is_deleted=false";
									mysql.query(function(err,results1){
										if(err){
											res.status(500).json({status:500,statusText: err.code});
										} else {
											if(results1.length > 0){
												//search for duplicate and not deleted
												var searchDup = "select count(*) from asset where original_name='"+req.file.originalname+"' and parent="+results1[0].id+" and is_deleted=false";
												mysql.query(function(err,results2){
													if(err){
														res.status(500).json({status:500,statusText: err.code});
													} else {
														//changing duplicate folder name
														var new_filename = req.file.originalname;
														if(results2[0].count > 0){
															new_filename = [new_filename, "(", results2[0].count, ")"].join('');
														}
														var newAsset = "insert into asset (is_directory,is_deleted,created_date,metadata,name,original_name,parent,owner) " +
														"values (false,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+JSON.stringify(req.file)+"','"+new_filename+"','"+req.file.originalname+"',"+results1[0].id+","+results[0].owner+")";
														mysql.query(function(err,results){
															if(err){
																res.status(500).json({status:500,statusText: err.code});
															} else {
																res.status(200).json({status:200,statusText:"Success"});
															}  
														},newAsset);
													}  
												},searchDup);
											} else {
												res.status(400).json({status:400,statusText:"Parent does not exist"});
											}
										}  
									},getParent);
								}
							} else {   
								res.status(400).json({status:400,statusText:"Parent does not exist"});
							}
						}  
					},getSuperParent);
				} else {
					//search for duplicate in shared also and not deleted
					var searchDup="select count(*) from "+
						"((select * from asset where original_name='"+req.file.originalname+"' and owner="+req.session.id+" and is_deleted=false "+
						//check shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"user_asset_shared as uas "+
						"on a.id=uas.asset "+
						"where a.original_name='"+req.file.originalname+"' and uas.user="+req.session.id+" and is_deleted=false) "+
						//check group shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"(select gas.* from (select * from groups where owner="+req.session.id+" "+
						"union "+
						"select groups.* from groups "+
						"inner join "+
						"user_groups "+
						"on groups.id=user_groups.groups "+
						"where user_groups.user="+req.session.id+") res "+
						"inner join "+
						"groups_asset_shared as gas "+
						"on res.id=gas.groups) res1 "+
						"on res1.asset=a.id "+
						"where a.original_name='"+req.file.originalname+"' and a.is_deleted=false) result";
					mysql.query(function(err,results){
						if(err){
							res.status(500).json({status:500,statusText: err.code});
						} else {
							//changing duplicate folder name
							var new_filename = req.file.originalname;
							if(results[0].count > 0){
								new_filename = [new_filename, "(", results[0].count, ")"].join('');
							}
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
					},searchDup);
				}
			} else {
				res.status(400).json({status:400,statusText:"Bad request"});
			}
		} else if(req.body.is_directory === 'true'){
			if(req.body.name !== undefined && req.body.name !== null) {
				if(req.body.parent !== undefined && req.body.parent !== null && req.body.super_parent !== undefined && req.body.super_parent !== null) {
					var getSuperParent="select * from asset where name='"+req.body.super_parent+"' and owner="+req.session.id+" and is_deleted=false "+
						//check shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"user_asset_shared as uas "+
						"on a.id=uas.asset "+
						"where uas.user="+req.session.id+" and a.name='"+req.body.super_parent+"' and is_deleted=false "+
						//from group shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"(select gas.* from (select * from groups where owner="+req.session.id+" "+
						"union "+
						"select groups.* from groups "+
						"inner join "+
						"user_groups "+
						"on groups.id=user_groups.groups "+
						"where user_groups.user="+req.session.id+") res "+
						"inner join "+
						"groups_asset_shared as gas "+
						"on res.id=gas.groups) res1 "+
						"on res1.asset=a.id "+
						"where a.name='"+req.body.super_parent+"' and a.is_deleted=false";
					mysql.query(function(err,results){
						if(err){
							res.status(500).json({status:500,statusText: err.code});
						} else {
							if(results.length > 0) {
								if(req.body.super_parent === req.body.parent) {
									//search for duplicate and not deleted
									var searchDup = "select count(*) from asset where original_name='"+req.body.name+"' and parent="+results[0].id+" and is_deleted=false";
									mysql.query(function(err,results2){
										if(err){
											res.status(500).json({status:500,statusText: err.code});
										} else {
											//changing duplicate folder name
											var new_filename = req.body.name;
											if(results2[0].count > 0){
												new_filename = [new_filename, "(", results2[0].count, ")"].join('');
											}
											var newAsset = "insert into asset (is_directory,is_deleted,created_date,name,original_name,parent,owner) " +
												"values (true,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+new_filename+"','"+req.body.name+"',"+results[0].id+","+results[0].owner+")";
											mysql.query(function(err,results){
												if(err){
													res.status(500).json({status:500,statusText: err.code});
												} else {
													res.status(200).json({status:200,statusText:"Success"});
												}  
											},newAsset);
										}  
									},searchDup);
								} else {
									var getParent = "select id from asset where name='"+req.body.parent+"' and owner="+results[0].owner+" and is_deleted=false";
									mysql.query(function(err,results1){
										if(err){
											res.status(500).json({status:500,statusText: err.code});
										} else {
											if(results1.length > 0){
												//search for duplicate and not deleted
												var searchDup = "select count(*) from asset where original_name='"+req.body.name+"' and parent="+results1[0].id+" and is_deleted=false";
												mysql.query(function(err,results2){
													if(err){
														res.status(500).json({status:500,statusText: err.code});
													} else {
														//changing duplicate folder name
														var new_filename = req.body.name;
														if(results2[0].count > 0){
															new_filename = [new_filename, "(", results2[0].count, ")"].join('');
														}
														var newAsset = "insert into asset (is_directory,is_deleted,created_date,name,original_name,parent,owner) " +
															"values (true,false,'"+moment().format('YYYY-MM-DD HH:mm:ss')+"','"+new_filename+"','"+req.body.name+"',"+results1[0].id+","+results[0].owner+")";
														mysql.query(function(err,results){
															if(err){
																res.status(500).json({status:500,statusText: err.code});
															} else {
																res.status(200).json({status:200,statusText:"Success"});
															}  
														},newAsset);
													}  
												},searchDup);
											} else {
												res.status(400).json({status:400,statusText:"Parent does not exist"});
											}
										}  
									},getParent);
								}
							} else {   
								res.status(400).json({status:400,statusText:"You don't have access to this folder"});
							}
						}  
					},getSuperParent);
				} else {
					//search for duplicate in shared also and not deleted
					var searchDup="select count(*) from "+
						"((select * from asset where original_name='"+req.body.name+"' and owner="+req.session.id+" and is_deleted=false "+
						//from shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"user_asset_shared as uas "+
						"on a.id=uas.asset "+
						"where a.original_name='"+req.body.name+"' and uas.user="+req.session.id+" and is_deleted=false) "+
						//from group shared
						"union "+
						"select a.* from asset as a "+
						"inner join "+
						"(select gas.* from (select * from groups where owner="+req.session.id+" "+
						"union "+
						"select groups.* from groups "+
						"inner join "+
						"user_groups "+
						"on groups.id=user_groups.groups "+
						"where user_groups.user="+req.session.id+") res "+
						"inner join "+
						"groups_asset_shared as gas "+
						"on res.id=gas.groups) res1 "+
						"on res1.asset=a.id "+
						"where a.original_name='"+req.body.name+"' and a.is_deleted=false) result";
					mysql.query(function(err,results){
						if(err){
							res.status(500).json({status:500,statusText: err.code});
						} else {
							//changing duplicate folder name
							var new_filename = req.body.name;
							if(results[0].count > 0){
								new_filename = [new_filename, "(", results[0].count, ")"].join('');
							}
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
					},searchDup);
				}
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
			var getAssets = "select a.*, true as is_starred, if(a.owner="+req.session.id+",true,false) as can_delete_or_share from asset as a "+
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
			var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete_or_share from "+
							"((select * from asset where owner="+req.session.id+" and parent is null and is_deleted=false "+
							//from shared
							"union "+
							"select a.* from asset as a "+
							"inner join user_asset_shared as uas "+
							"on a.id= uas.asset "+
							"where uas.user="+req.session.id+" and a.is_deleted=false) "+
							//from group shared
							"union "+
							"select a.* from asset as a "+
							"inner join "+
							"(select gas.* from (select * from groups where owner="+req.session.id+" "+
							"union "+
							"select groups.* from groups "+
							"inner join "+
							"user_groups "+
							"on groups.id=user_groups.groups "+
							"where user_groups.user="+req.session.id+") res "+
							"inner join "+
							"groups_asset_shared as gas "+
							"on res.id=gas.groups) res1 "+
							"on res1.asset=a.id "+
							"where a.is_deleted=false) result "+
							"left join user_asset_starred as uast on result.id=uast.asset "+
							"order by created_date desc limit 10";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					res.status(200).json({status:200,statusText:"Success",data:results});
				}  
			},getAssets);
		} else if(req.body.parent !== undefined && req.body.parent !== null && req.body.super_parent !== undefined && req.body.super_parent !== null){
			//check permission
			var getSuperParent="select * from asset where name='"+req.body.super_parent+"' and owner="+req.session.id+" and is_deleted=false "+
				//from shared
				"union "+
				"select a.* from asset as a "+
				"inner join "+
				"user_asset_shared as uas "+
				"on a.id=uas.asset "+
				"where uas.user="+req.session.id+" and a.name='"+req.body.super_parent+"' and is_deleted=false "+
				//from shared
				"union "+
				"select a.* from asset as a "+
				"inner join "+
				"(select gas.* from (select * from groups where owner="+req.session.id+" "+
				"union "+
				"select groups.* from groups "+
				"inner join "+
				"user_groups "+
				"on groups.id=user_groups.groups "+
				"where user_groups.user="+req.session.id+") res "+
				"inner join "+
				"groups_asset_shared as gas "+
				"on res.id=gas.groups) res1 "+
				"on res1.asset=a.id "+
				"where a.name='"+req.body.super_parent+"' and a.is_deleted=false";
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results.length > 0) {
						if(req.body.super_parent === req.body.parent) {
							var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete_or_share from "+
								"(select * from asset where parent="+results[0].id+" and is_deleted=false) result "+
								"left join user_asset_starred as uast on result.id=uast.asset";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									res.status(200).json({status:200,statusText:"Success",data:results});
								}  
							},getAssets);
						} else {
							var getParent = "select id from asset where name='"+req.body.parent+"' and owner="+results[0].owner+" and is_deleted=false";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results.length > 0){
										var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete_or_share from "+
											"(select * from asset where parent="+results[0].id+" and is_deleted=false) result "+
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
						}
					} else {   
						res.status(400).json({status:400,statusText:"You don't have access to this folder"});
					}
				}  
			},getSuperParent);
		} else {
			var getAssets = "select *, if(uast.user="+req.session.id+",true,false) as is_starred, if(result.owner="+req.session.id+",true,false) as can_delete_or_share from "+
							"((select * from asset where owner="+req.session.id+" and parent is null and is_deleted=false "+
							//from shared
							"union "+
							"select a.* from asset as a "+
							"inner join user_asset_shared as uas "+
							"on a.id= uas.asset "+
							"where uas.user="+req.session.id+" and a.is_deleted=false) "+
							//from group shared
							"union "+
							"select a.* from asset as a "+
							"inner join "+
							"(select gas.* from (select * from groups where owner="+req.session.id+" "+
							"union "+
							"select groups.* from groups "+
							"inner join "+
							"user_groups "+
							"on groups.id=user_groups.groups "+
							"where user_groups.user="+req.session.id+") res "+
							"inner join "+
							"groups_asset_shared as gas "+
							"on res.id=gas.groups) res1 "+
							"on res1.asset=a.id "+
							"where a.is_deleted=false) result "+
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

function shareAsset(req, res) {
	if(req.session.isValid) {
		if(req.body.assetId !== undefined && req.body.assetId !== null && req.body.shareWith !== undefined && req.body.shareWith !== null && req.body.targetId !== undefined && req.body.targetId !== null) {
			//check if owner
			var isOwner = "select count(*) as count from asset where id="+req.body.assetId+" and owner="+req.session.id;
			mysql.query(function(err,results){
				if(err){
					res.status(500).json({status:500,statusText: err.code});
				} else {
					if(results[0].count > 0){
						if(req.body.shareWith === "users"){
							//check already shared, if already added send error else share with new user
							var checkShared = "select count(*) as count from user_asset_shared where user="+req.body.targetId+" and asset="+req.body.assetId;
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results[0].count > 0){
										res.status(400).json({status:400,statusText:"Asset already shared"});
									} else {
										//add to shared
										var addToShared = "insert into user_asset_shared (user,asset) values ("+req.body.targetId+","+req.body.assetId+")";
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},addToShared);
									}
								}
							},checkShared);
						} else {
							//check if already shared with this group, if already added send error else share with new group
							var checkShared = "select count(*) as count from groups_asset_shared where groups="+req.body.targetId+" and asset="+req.body.assetId;
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results[0].count > 0){
										res.status(400).json({status:400,statusText:"Asset already shared"});
									} else {
										//add to shared
										var addToShared = "insert into groups_asset_shared (groups,asset) values ("+req.body.targetId+","+req.body.assetId+")";
										mysql.query(function(err,results){
											if(err){
												res.status(500).json({status:500,statusText: err.code});
											} else {
												res.status(200).json({status:200,statusText:"Success"});
											}  
										},addToShared);
									}
								}
							},checkShared);
						}
					} else {
						res.status(400).json({status:400,statusText:"Asset does not exist"});
					}
				}  
			},isOwner);
		} else {
			res.status(400).json({status:400,statusText:"Bad request"});
		}
	} else {
		res.status(401).json({status:401,statusText:"Not authorized"});
	}
}

function downloadAsset(req, res) {
	if(req.session.isValid) {
		if(req.params.assetId !== undefined && req.params.assetId !== null) {
			if(req.params.super_parent !== undefined && req.params.super_parent !== null) {
				//check permission
				var getSuperParent="select * from asset where name='"+req.params.super_parent+"' and owner="+req.session.id+" and is_deleted=false "+
					//from shared
					"union "+
					"select a.* from asset as a "+
					"inner join "+
					"user_asset_shared as uas "+
					"on a.id=uas.asset "+
					"where uas.user="+req.session.id+" and a.name='"+req.params.super_parent+"' and is_deleted=false"+
					//from group shared
					"union "+
					"select a.* from asset as a "+
					"inner join "+
					"(select gas.* from (select * from groups where owner="+req.session.id+" "+
					"union "+
					"select groups.* from groups "+
					"inner join "+
					"user_groups "+
					"on groups.id=user_groups.groups "+
					"where user_groups.user="+req.session.id+") res "+
					"inner join "+
					"groups_asset_shared as gas "+
					"on res.id=gas.groups) res1 "+
					"on res1.asset=a.id "+
					"where a.name='"+req.params.super_parent+"' and a.is_deleted=false";
				mysql.query(function(err,results){
					if(err){
						res.status(500).json({status:500,statusText: err.code});
					} else {
						if(results.length > 0) {
							var findAsset = "select * from asset where id="+req.params.assetId+" and owner="+results[0].owner+" and is_deleted=false";
							mysql.query(function(err,results){
								if(err){
									res.status(500).json({status:500,statusText: err.code});
								} else {
									if(results.length > 0) {
										var metadata = JSON.parse(results[0].metadata);
										var file = "./tmp/"+metadata.filename;
										res.setHeader("Content-disposition", "attachment; filename="+results[0].name);
										res.setHeader("Content-type", metadata.mimetype);
								  		res.download(file);
									} else {
										res.status(400).json({status:400,statusText:"You don't have access to this folder"});
									}
								}  
							},findAsset);
						} else {
							res.status(400).json({status:400,statusText:"You don't have access to this folder"});
						}
					}  
				},getSuperParent);
	  		} else {
	  			var findAsset="select * from asset where id="+req.params.assetId+" and owner="+req.session.id+" and is_deleted=false "+
					//from shared
					"union "+
					"select a.* from asset as a "+
					"inner join "+
					"user_asset_shared as uas "+
					"on a.id=uas.asset "+
					"where uas.user="+req.session.id+" and a.id='"+req.params.assetId+"' and is_deleted=false"+
					//from group shared
					"union "+
					"select a.* from asset as a "+
					"inner join "+
					"(select gas.* from (select * from groups where owner="+req.session.id+" "+
					"union "+
					"select groups.* from groups "+
					"inner join "+
					"user_groups "+
					"on groups.id=user_groups.groups "+
					"where user_groups.user="+req.session.id+") res "+
					"inner join "+
					"groups_asset_shared as gas "+
					"on res.id=gas.groups) res1 "+
					"on res1.asset=a.id "+
					"where a.id='"+req.params.assetId+"' and a.is_deleted=false";
				mysql.query(function(err,results){
					if(err){
						res.status(500).json({status:500,statusText: err.code});
					} else {
						if(results.length > 0) {
							var metadata = JSON.parse(results[0].metadata);
							var file = "./tmp/"+metadata.filename;
							res.setHeader("Content-disposition", "attachment;filename="+results[0].name);
							res.setHeader("Content-type", metadata.mimetype);
					  		res.download(file);
						} else {
							res.status(400).json({status:400,statusText:"You don't have access to this folder"});
						}
					}  
				},findAsset);
	  		}
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
exports.shareAsset = shareAsset;
exports.downloadAsset = downloadAsset;