"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");
const ChatBot = require("./ChatBot/WatsonConversation");
const TextAnalyzer = require("./Analysis/WatsonTextAnalyzer");
const Database = require("./Database/database");
const LocationExplorer = require("./KnowledgeSystem/LocationExplorer");

//Setup express layer
const express = new Express();
express.use(bp.json({type: 'application/json'})); 

//Setup HTTP server
var server = http.createServer(express);

//Create a new chatbot
const chatbot = new ChatBot();

//Get the database singleton
const database = Database.GetInstance();

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
        database.tables.sessions.GetItem(sessionId, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                var explorer = new LocationExplorer();
                if (data.Concepts) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchConcepts(data.Concepts.values);
                }
                explorer.Search(function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(JSON.stringify({
                            match_count: data.length, 
                            matches: data
                        }));
                    }
                });
            }
        });
    } else {
        //Throw an error if the request was malformed
        console.log("Malformed request");
        res.status(400).send("ERROR: Bad request");
    }
});

/*** 
    "Request" : {
        "session_token" : "CONVERSATION_ID_STRING",
        "input" : "USER_INPUT_STRING"
    }

    "Response" : {
        "session_id" : "SESSION_ID_STRING",
        "session_token" : "CONVERSATION_ID_STRING",
        "response" : "CHATBOT_RESPONSE"
    }
 */
express.post('/conversation', (req, res) => {
    var sessionToken = req.body.session_token;
    var input = req.body.input;

    //Determine whether the request is malformed
    if (typeof(sessionToken) != 'undefined' && typeof(input) != 'undefined') {
        chatbot.sendMessage(sessionToken, input, function(err, chatbotData) {
            //Determine whether there was an internal error
            if (err) {
                console.log(err);
                res.status(500).send("ERROR: Internal Server Error");
            } else {
                //Respond with conversation data
                res.send(JSON.stringify({
                    session_id: chatbotData.sessionId, //Session ID used to reference the conversation
                    session_token: chatbotData.sessionToken, //Session token used to maintain state
	                response: chatbotData.text //The chatbot response
                }));

                //Analyze the user input
                var analyzer = new TextAnalyzer(input);
                var conceptExtractor = new analyzer.ConceptExtractor(); //Extract concepts
                //Perform the analysis
                analyzer.Analyze(function(err) {
                    //Check for analysis error
                    if (err) {
                        console.log(err);
                    } else {
                        //Store the concepts that were found
                        var concepts = conceptExtractor.GetConcepts();
                        console.log("Concepts Detected: " + concepts);
                        //Determine whether any concepts were found
                        if (concepts.length > 0) {
                            //Associate these concepts with this user session
                            database.tables.sessions.AddConcepts(chatbotData.sessionId, concepts, function(error) {
                                //Log any errors
                                if (error) {
                                    console.log(error);
                                }
                            });
                        }
                    }
                });
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