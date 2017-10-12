const chai = require('chai');  
const expect = require('chai').expect;
 
chai.use(require('chai-http'));
 
const app = require('../app.js');

describe('http tests when not authorized', function(){
	
	before(function() {
 
	});
	 
	after(function() {
	 
	});

	it('should be able to login with correct details', function(){
		return chai.request(app)
      		.post('/api/signin')
      		.send({
        		email:"ankit@gmail.com",
        		password:"ankit"
      		})
      		.then(function(res) {
      			expect(res).to.have.status(200);
      		})
      		.catch(function(err){
      			throw new Error('Failed');
      		});
	});

	it('should give error if trying to login with incorrect details', function(){
		return chai.request(app)
      		.post('/api/signin')
      		.send({
        		email:"ankit@gmail.com",
        		password:"abcde"
      		})
      		.then(function(res) {
      			throw new Error('Failed');
      		})
      		.catch(function(err){
      			expect(err).to.have.status(401);
      		});
	});

	it('should give error if trying to sign up without required fields', function(){
		return chai.request(app)
      		.post('/api/signup')
      		.send({
        		email:"ankit@gmail.com",
        		password:"abcde"
      		})
      		.then(function(res) {
      			throw new Error('Failed');
      		})
      		.catch(function(err){
      			expect(err).to.have.status(400);
      		});
	});

	it('should give error if trying to sign up with existing email', function(){
		return chai.request(app)
      		.post('/api/signup')
      		.send({
        		email:"ankit@gmail.com",
        		password:"abcde",
        		first_name:"ankit",
        		last_name:"bharadiya"
      		})
      		.then(function(res) {
      			throw new Error('Failed');
      		})
      		.catch(function(err) {
      			expect(err).to.have.status(409);
      		});
	});

	it('should be able to logout', function(){
		return chai.request(app)
      		.post('/api/logout')
      		.then(function(res) {
      			expect(res).to.have.status(200);
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

});

describe('http tests when authorized', function(){

	var cookie = '';

	before(function() {
 		return chai.request(app)
	    	.post('/api/signin')
      		.send({
        		email:"ankit@gmail.com",
        		password:"ankit"
      		})
      		.then(function(res) {
      			cookie = res.headers['set-cookie'][0].split(';')[0];
      		})
      		.catch(function(err){
      			throw new Error('Failed');
      		});
	});
	 
	after(function() {
	 
	});

	
	it('should return the user profile', function(){
		return chai.request(app)
      		.get('/api/user_profile')
      		.set('Cookie', cookie)
      		.then(function(res) {
      			expect(res).to.have.status(200);
      			expect(res.body.data).to.be.an('object');
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

	it('should return the user activity', function(){
		return chai.request(app)
      		.get('/api/user_activity')
      		.set('Cookie', cookie)
      		.then(function(res) {
      			expect(res).to.have.status(200);
      			expect(res.body.data).to.be.an('array');
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

	it('should be able to get all the assets', function(){
		return chai.request(app)
      		.post('/api/get_assets')
      		.set('Cookie', cookie)
      		.then(function(res) {
      			expect(res).to.have.status(200);
      			expect(res.body.data).to.be.an('array');
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

	it('should be able to get starred assets', function(){
		return chai.request(app)
      		.post('/api/get_assets')
      		.send({
        		starred:true
      		})
      		.set('Cookie', cookie)
      		.then(function(res) {
      			expect(res).to.have.status(200);
      			expect(res.body.data).to.be.an('array');
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

	it('should be able to get recent assets', function(){
		return chai.request(app)
      		.post('/api/get_assets')
      		.send({
        		recent:true
      		})
      		.set('Cookie', cookie)
      		.then(function(res) {
      			expect(res).to.have.status(200);
      			expect(res.body.data).to.be.an('array');
      		})
      		.catch(function(err) {
		        throw new Error('Failed');
		    });
	});

});