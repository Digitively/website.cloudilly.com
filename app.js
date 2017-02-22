var express= require("express");
var app= express();
app.use(express.static("./HTML"));
var httpServer= require("http").createServer(app);
httpServer.listen(3000);
