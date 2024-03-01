
const dotenv = require('dotenv');
dotenv.config();

const mysql = require("mysql");
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

connection.connect((error) => {
	if(error){
		console.log('Error connecting MySQL Database');
		return;
	}
	console.log('Connection established sucessfully');
});

connection.query('SELECT * user', (error, results, fields) => {
    if (error) {
        console.error('Error performing query:', error);
        return;
    }
    console.log(results); // Process the query results
});

connection.end((error) => {
    if (error) {
        console.error('Error closing connection:', error);
    } else {
        console.log('Connection closed successfully');
    }
});
