const express = require("express");
const path = require("path");
const http = require("http");
const { Client } = require('pg');


//PSQL
const client = new Client({
  user: 'web',
  host: '68.183.163.50',
  database: 'aggieeats',
  password: 'webpass',
  port: 5432,
});

client.connect((err) => {
if (err) {
	console.error('connection error', err.stack);
} else {
	console.log('connected to pSQL');
}
})


const port = process.env.PORT || 4001;

const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/:location/:from/:to', function(req, res) {

	//Max request window is 24 hours.

	if(req.params.to-req.params.from > 24*60*60){
		req.params.to = req.params.from + 24*60*60
	}

	
	client.query("SELECT * FROM " + req.params["location"] +" WHERE timestamp >= " + req.params.from + " and timestamp <= " + req.params.to, (err, dbres) => {
		if(err){
			res.send(err)
		}else{
			res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
			res.send(dbres["rows"].map(x=> [x["timestamp"], x["devices"]]))
		}
	})
	
});

app.post('/api/:location/', function(req, res) {
	const key = req.query['key'];
	const data = req.query['data'];
	if(key == 'ab5f6c0d-1d82-41d4-888b-f610ade20d87'){
		client.query("INSERT INTO " + req.params["location"] + " (timestamp, devices) VALUES(CURRENT_TIMESTAMP, " + data + ")", (err, dbres) =>{
		if(err){
			res.status(405)
			res.send('Method Not Allowed');
		}else{
			res.send('OK');
		}
		})
	}else{
		res.status(401)
	}
});


const server = http.createServer(app);

server.listen(port, () => console.log('Listening on port '+ port));


