"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");
const ChatBot = require("./ChatBot/WatsonConversation");
const TextAnalyzer = require("./Analysis/WatsonTextAnalyzer");
const Database = require("./Database/database");
const LocationExplorer = require("./KnowledgeSystem/LocationExplorer");
const FB = require('fb');
var fb = new FB.Facebook();
//Setup express layer
const express = new Express();
express.use(bp.json({type: 'application/json'})); 

//Setup HTTP server
var server = http.createServer(express);

//Create a new chatbot
const chatbot = new ChatBot();

//Get the database singleton
const database = Database.GetInstance();

//Initialize passport
var session = require("express-session"),
    bodyParser = require("body-parser");



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
        //Search the database for the supplied session information
        database.tables.sessions.GetItem(sessionId, function(err, data) {
            //Determine whether there was an internal error
            if (err || typeof(data) === 'undefined') {
                console.log(err);
                res.send(JSON.stringify({
                    match_count: 0, 
                    matches: []
                }));
            } else {
                var explorer = new LocationExplorer(); //Create a new location explorer
                //Determine whether there are any concepts associated with the session
                if (data.Concepts) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchConcepts(data.Concepts.values); //Add the concepts 
                }
                //Determine whether there are any keywords associated with the session
                if (data.Keywords) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchKeywords(data.Keywords.values); //Add the keywords 
                }
                //Determine whether there are any entities associated with the session
                if (data.Entities) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchEntities(data.Entities.values); //Add the entities 
                }
                //Search for locations based on the supplied parameters
                explorer.Search(function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        //Respond with the matching location data
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
                var keywordExtractor = new analyzer.KeywordExtractor(); //Extract keywords
                var entityExtractor = new analyzer.EntityExtractor(); //Extract entities
                //Perform the analysis
                analyzer.Analyze(function(err) {
                    //Check for analysis error
                    if (err) {
                        console.log(err);
                    } else {
                        //Store the concepts that were found
                        var concepts = conceptExtractor.GetConcepts();
                        var keywords = keywordExtractor.GetKeywords();
                        var entities = entityExtractor.GetEntities();
                        //Determine whether any concepts were found
                        if (concepts.length > 0) {
                            console.log("Concepts Detected: " + concepts);
                            //Associate these concepts with this user session
                            database.tables.sessions.AddConcepts(chatbotData.sessionId, concepts, function(error) {
                                //Log any errors
                                if (error) {
                                    console.log(error);
                                }
                            });
                        }
                        //Determine whether any keywords were found
                        if (keywords.length > 0) {
                            console.log("Keywords Detected: " + keywords);
                            //Associate these keywords with this user session
                            database.tables.sessions.AddKeywords(chatbotData.sessionId, keywords, function(error) {
                                //Log any errors
                                if (error) {
                                    console.log(error);
                                }
                            });
                        }
                        //Determine whether any entities were found
                        if (entities.length > 0) {
                            console.log("Entities Detected: " + entities);
                            //Associate these entities with this user session
                            database.tables.sessions.AddEntities(chatbotData.sessionId, entities, function(error) {
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



/***
Websocket

route: analyzefacebook
"Request" : {
   "sessionID": "SESSIONID",
   "token" : "TOKEN"
}"Response" : {
   "done" : TRUE/FALSE,
   "status" : "STATUS_MESSAGE",
   "concepts" : [
       {
           "name" : "CONCEPT_NAME",
           "confidence" : CONFIDENCE_VALUE
       {
   ]
}
*/
express.post('/analyzefacebook', function (req, res) {
    //Get userToken and sessionID from the client
    console.log("we are in")
    var userToken = req.body.token;
    var sessionID = req.body.session_id;
    //var userToken = 'EAACEdEose0cBAJe2EDMcUk5C7UlY1k2a3SR3yoIj5aJZAPkKcQhxODHGmtPOf29SNustjj5yKaQnGLz47kMShQyE7T1341iWbYrqy8nJpTReUGeCaZBZCPEWR9ZAMbtbN2gAEySFzo8ZBP4c7R2ziAuagXdKRiRb2kHsONHX92PuizIOlAItsPut4WAcpu2WcYF9ZBbE6IDAZDZD'
    var postsArray;
    //var sessionID = 0;
    //url = 'https://graph.facebook.com/me/posts'
    //Authorize with access token
    FB.setAccessToken(userToken);
    //Get posts
    FB.api('me/posts', { access_token: userToken },function (res) {
        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        console.log(postsArray)
        postsArray = res.data;
        GetConceptsFromPosts(postsArray,sessionID)
        console.log(res.data);
        
    });
    var status = "Facebook data retrieved"

});
//Get the correct port from the environment variables
//var port = process.env.PORT;

//Uncomment to test on localhost, port 8000
var port = 8000;

//Start the server
server.listen(port, () => {
    console.log("Access on Android Server bound on port: " + port.toString());
});
function GetConceptsFromPosts(postsArray, sessionID) {
    for (var i = 0; i < postsArray.length; i++) {
        var singlePost = postsArray[i];
        if (singlePost.hasOwnProperty('message')) {
            var analyzer = new TextAnalyzer(singlePost.message);
            var conceptExtractor = new analyzer.ConceptExtractor(); //Extract concepts
            var keywordExtractor = new analyzer.KeywordExtractor(); //Extract keywords
            var entityExtractor = new analyzer.EntityExtractor(); //Extract entities

            analyzer.Analyze(function (err) {
                //Check for analysis error
                if (err) {
                    console.log(err);
                } else {
                    //Store the concepts that were found
                    var concepts = conceptExtractor.GetConcepts();
                    var keywords = keywordExtractor.GetKeywords();
                    var entities = entityExtractor.GetEntities();
                    //Determine whether any concepts were found
                    if (concepts.length > 0) {
                        console.log("Concepts Detected: " + concepts);
                        //Associate these concepts with this user session
                        database.tables.sessions.AddConcepts(sessionID, concepts, function (error) {
                            //Log any errors
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                    //Determine whether any keywords were found
                    if (keywords.length > 0) {
                        console.log("Keywords Detected: " + keywords);
                        //Associate these keywords with this user session
                        database.tables.sessions.AddKeywords(sessionID, keywords, function (error) {
                            //Log any errors
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                    //Determine whether any entities were found
                    if (entities.length > 0) {
                        console.log("Entities Detected: " + entities);
                        //Associate these entities with this user session
                        database.tables.sessions.AddEntities(sessionId, entities, function (error) {
                            //Log any errors
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                }
            });
        
        }
    }
}
