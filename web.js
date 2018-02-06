"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");

//Setup express layer
const express = new Express();
express.use(bp.json({type: 'application/json'})); 

//Setup HTTP server
var server = http.createServer(express);

express.post('/match', (req, res) => {
    var sessionId = req.body.session_id;

    //Determine whether the request is malformed
    if (typeof(sessionId) != 'undefined') {
        res.send("TODO: finish this route");
    } else {
        //Throw an error if the request was malformed
        console.log("Malformed request");
        res.status(400).send("ERROR: Bad request");
    }
});

express.post('/conversation', (req, res) => {
    var sessionId = req.body.session_id;
    var input = req.body.input;

    //Determine whether the request is malformed
    if (typeof(sessionId) != 'undefined' && typeof(input) != 'undefined') {
        res.send("TODO: finish this route");
    } else {
        //Throw an error if the request was malformed
        console.log("Malformed request");
        res.status(400).send("ERROR: Bad request");
    }
});

//Get the correct port from the environment variables
//var port = process.env.PORT;

//Uncomment to test on localhost, port 8000
var port = 8000;

//Start the server
server.listen(port, () => {
    console.log("Access on Android Server bound on port: " + port.toString());
});