var express = require("express");
var server = express();
//just an ordinary static file server using express.js
server.use("/", express.static(__dirname + "/public"));
server.listen(8080);
console.log("Go to localhost:8080 in your browser");
