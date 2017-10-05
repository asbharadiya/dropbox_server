var mysql = require('mysql');

//Put your mysql configuration settings - user, password, database and port
function getConnection(){
	var connection = mysql.createConnection({
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
	
	connection.query(sqlQuery, function(err, rows, fields) {
		callback(err, rows);
	});
	
	console.log("\nConnection closed..");
	connection.end();
}

exports.query=query;