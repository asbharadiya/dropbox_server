var auth = require('./auth');

module.exports = function(app){

    app.post('/api/login', auth.login);

    //other routes..
}