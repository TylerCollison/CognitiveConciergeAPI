"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");
const ChatBot = require("./ChatBot/WatsonConversation")

//Setup express layer
const express = new Express();
express.use(bp.json({type: 'application/json'})); 

//Setup HTTP server
var server = http.createServer(express);

const chatbot = new ChatBot();

/**
    "Request" : {
        "session_id" : ""
    }

    "Response" : {
        "match_count": COUNT,
        "matches" : [
            {
                "id" : "LOCATION_ID",
                "location" : "LOCATION_STRING",
                "description" : "LOCATION_DESCRIPTION", 
                "confidence" : "CONFIDENCE_VALUE"
            }
        ]
    }
 */
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

/*** 
    "Request" : {
        "session_id" : "CONVERSATION_ID_STRING",
        "input" : "USER_INPUT_STRING"
    }

    "Response" : {
        "session_id" : "CONVERSATION_ID_STRING",
        "response" : "CHATBOT_RESPONSE"
    }
 */
express.post('/conversation', (req, res) => {
    var sessionId = req.body.session_id;
    var input = req.body.input;

    //Determine whether the request is malformed
    if (typeof(sessionId) != 'undefined' && typeof(input) != 'undefined') {
        chatbot.sendMessage(sessionId, input, function(err, data) {
            //Determine whether there was an internal error
            if (err) {
                console.log(err);
                res.status(500).send("ERROR: Internal Server Error");
            } else {
                //Respond with conversation data
                res.send(JSON.stringify({
                    session_id : data.sessionId, //Session ID used to maintain state
	                response : data.text //The chatbot response
                }));
            }
        });
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