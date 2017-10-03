
function login(req, res){
	var username, password;
	username = req.param("username");
	password = req.param("password");
	
	if(username!== ''  && password!== '') {
		console.log(username+" "+password);
		if(username === "test" && password === "test") {
			//Assigning the session
			//req.session.username = username;
			res.status(200).json({message: "Success"});
		} else {
			res.status(401).json({message: "Login failed"});
		}
	} else {
		res.status(401).json({message: "Login failed"});
	}
}

exports.login = login;
