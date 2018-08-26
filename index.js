var mongo = require('mongodb');
var http = require('http');
var url = require('url');
var fs = require('fs');

let portN = 27017;

http.createServer(function(req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    fs.readFile(filename, function(err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }
        res.writeHead(200);
        res.write(data);
        return res.end();
    });
}).listen(portN);
console.log("Local server on port " + portN);

/*
// CREATE DATABASE
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/game_database";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

//CREATE COLLECTION
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("game_database");
    dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
});

//INSERT INTO COLLECTION
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("game_database");
  var myobj = { name: "TestUser", email: "test@test.com" };
  dbo.collection("users").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 user inserted");
    db.close();
  });
});
*/