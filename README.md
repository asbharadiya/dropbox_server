# dropbox_server
Prototype of Dropbox (Back End)

#### Steps to run the server side
* Clone this repository on your machine
* Install MySQL on your machine if not installed
* Run dbSchema/schema.sql in your MySQL database
* Run dbSchema/sample_users.sql in your MySQL database
* Change database configuration in routes/mysql.js
```sh
conn = mysql.createConnection({
    host : 'localhost',
    user : '<username>',
    password : '<password>',
    database : 'dropbox',
    port : 3306
});
```
* Open terminal, go to this folder and run following command to install all the dependencies
```sh
npm install
```
* Then to run the app, run following command at same location in terminal
```sh
npm start
```
* To run the test cases, run the following command
```sh
npm test
```
