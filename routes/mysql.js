var mysql = require('mysql');

var numberOfConnection = 151;
var connectionStack = [];
var connectionQueue = [];


var createConnectionPool = function(numberOfConnection){
    
    console.log("creating connection pool...");
    var conn;
    for(var count=0; count < numberOfConnection; count++){
        conn = mysql.createConnection({
            host : 'localhost',
            user : 'root',
            password : 'root',
            database : 'dropbox',
            port : 3306
        });
        connectionStack.push(conn);
    }

}

var getConnection = function(callback){
    
    if(connectionStack.length > 0){
        //connection available, pop from the connection stack
        connection = connectionStack.pop();
        callback(null, connection);
    } else {
        //connection not available, push to connection wait queue
        connectionQueue.push(callback);
    }
}

//check for available connection every second
setInterval(function(){
    if(connectionStack.length > 0){
        if(connectionQueue.length > 0){
            callback = connectionQueue.shift();
            connection = connectionStack.pop();
            callback(null, connection);
        }
    }
}, 1000)


createConnectionPool(numberOfConnection);


function query(callback, sqlQuery) {

    console.log("\nSQL Query:" + sqlQuery);

    getConnection(function(err, connection) {
        connection.query(sqlQuery, function(err, result) {
            if (err) {
                console.log("ERROR: " + err.message);
            } else {
                connection.releaseConnection;
                connectionStack.push(connection);
                callback(err, result);
            }
        });
    });
}

exports.query=query;