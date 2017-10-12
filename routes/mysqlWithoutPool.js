var mysql = require('mysql');


//Put your mysql configuration settings - user, password, database and port
function getPool(){
	// var connection = mysql.createConnection({
	//     host     : 'localhost',
	//     user     : 'root',
	//     password : 'root',
	//     database : 'dropbox',
	//     port	 : 3306
	// });
	// return connection;
	console.log("creating pool...");
	var pool = mysql.createPool({
		connectionLimit : 500,
	    host     : 'localhost',
	    user     : 'root',
	    password : 'root',
	    database : 'dropbox',
	    port	 : 3306
	});
	return pool;
}

//var pool = getPool();

function queryWithPool(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	pool.query(sqlQuery, function(err, rows, fields) {
			
		if(err){
			console.log("ERROR: " + err.message);
		} else {	// return err or result
			callback(err, rows);
		}
		console.log("\nConnection closed..");
	
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


exports.queryWithPool=queryWithPool;
exports.queryWithoutPool=queryWithoutPool;