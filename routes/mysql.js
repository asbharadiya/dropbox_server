var mysql = require('mysql');

//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	// var connection = mysql.createConnection({
	//     host     : 'localhost',
	//     user     : 'root',
	//     password : 'root',
	//     database : 'dropbox',
	//     port	 : 3306
	// });
	// return connection;
	var connection = mysql.createPool({
		connectionLimit : 500,
	    host     : 'localhost',
	    user     : 'root',
	    password : 'root',
	    database : 'dropbox',
	    port	 : 3306
	});
	return connection;
}


function query(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection();
	
	connection.getConnection(function(err, connection){
		connection.query(sqlQuery, function(err, rows, fields) {
			
			if(err){
				console.log("ERROR: " + err.message);
			} else {	// return err or result
				callback(err, rows);
			}
			connection.release();
			console.log("\nConnection closed..");
		
		});
	});
	
}

function queryWithoutPool(callback,sqlQuery){

	console.log("\nSQL Query::"+sqlQuery);
	
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'root',
		database : 'dropbox',
		port	 : 3306
	});

	connection.connect();

	connection.query(sqlQuery, function(err, rows, fields) {
		
		if(err){
			console.log("ERROR: " + err.message);
		} else {	// return err or result
			callback(err, rows);
		}
		console.log("\nConnection closed..");

	});

	connection.end();
	
}


exports.query=query;
exports.queryWithoutPool=queryWithoutPool;