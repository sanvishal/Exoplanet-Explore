var express = require("express");
var server = express();
server.use("/", express.static(__dirname + "/public"));
server.listen(8080);
console.log("go to localhost:8080 in your browser");
