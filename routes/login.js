/**
 * Routes file for Login
 */

//Check login - called when '/checklogin' POST call given from AngularJS module in login.ejs
exports.checklogin = function(req,res)
{
	var username, password;
	username = req.param("username");
	password = req.param("password");
	
	var json_responses;
	
	if(username!== ''  && password!== '')
	{
		console.log(username+" "+password);
		if(username === "test" && password === "test")
		{
			//Assigning the session
			req.session.username = username;
			console.log("Session initialized");
			json_responses = {"statusCode" : 200};
			res.send(json_responses);
		}
		else
		{
			json_responses = {"statusCode" : 401};
			res.send(json_responses);
		}
	}
	else
	{
		json_responses = {"statusCode" : 401};
		res.send(json_responses);
	}
};


//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	//Checks before redirecting whether the session is valid
	if(req.session.username)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render("homepage",{username:req.session.username});
	}
	else
	{
		res.redirect('/');
	}
};


//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	console.log('Session destroyed');
	res.redirect('/');
};
