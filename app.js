var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var cors = require('cors');

var session = require('client-sessions');

var fs = require('file-system');
var dir = './tmp';


var router = require('./routes/router');

var app = express();

//CORS ENABLED
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
//app.options('*', cors());

//configure the sessions with our application
app.use(session({   
	cookieName: 'session',    
	secret: 'cmpe273_test_string',    
	duration: 24 * 60 * 60 * 1000,    //setting the time for active session
	activeDuration: 3 * 60 * 60 * 1000,  })); // setting time for the session to be active when the window is open // 5 minutes set currently

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.json('error');
});

http.createServer(app).listen(app.get('port'), function(){
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    console.log('Express server listening on port ' + app.get('port'));
});

