"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");
const ChatBot = require("./ChatBot/WatsonConversation");
const TextAnalyzer = require("./Analysis/WatsonTextAnalyzer");
const Database = require("./Database/database");
const LocationExplorer = require("./KnowledgeSystem/DynamoContinentExplorer");
const FB = require('fb');
var fb = new FB.Facebook();
//Setup express layer
const express = new Express();
express.use(bp.json({type: 'application/json'})); 

//Setup HTTP server
var server = http.createServer(express);

//Get the database singleton
const database = Database.GetInstance();

//Create a new chatbot and add action handlers
const chatbot = new ChatBot();

/**
 * Gets a random feature of a specified type from the specified session
 * @param {The id of the session to which the feature belongs} sessionId
 * @param {The type of the feature to retrieve} featureName
 * @param {Callback called upon completion of retrieval, which takes the result as a parameter} cb 
 */
function getSessionFeature(sessionId, featureName, cb) {
    //Search the database for the supplied session information
    database.tables.sessions.GetItem(sessionId, function(err, data) {
        //Determine whether there was an internal error
        if (err || typeof(data) === 'undefined') {
            if (err) {
                console.log(err);
            }
            cb(null);
        } else {
            //Determine whether there are any concepts associated with the session
            if (data[featureName] && data[featureName].values.length > 0) {
                var index = Math.floor(Math.random() * data[featureName].values.length);
                cb(data[featureName].values[index]);
            } else {
                cb(null);
            }
        }
    });
}

//Add actions handlers to the chatbot
chatbot.addGetConceptHandler(function(sessionId, cb, parameters) {
    getSessionFeature(sessionId, parameters.source + "Concepts", cb);
});

chatbot.addGetEntityHandler(function(sessionId, cb, parameters) {
    getSessionFeature(sessionId, parameters.source + "Entities", cb);
});

chatbot.addGetKeywordHandler(function(sessionId, cb, parameters) {
    getSessionFeature(sessionId, parameters.source + "Keywords", cb);
});

chatbot.addGetPointOfInterestHandler(function(sessionId, cb, parameters) {
    var explorer = new LocationExplorer(sessionId);
    explorer.SearchPointsOfInterest(function(error, data) {
        if (error) {
            console.log(error);
            cb(null);
        } else {
            var continentResults = data[parameters.continent];
            if (continentResults && continentResults.match_count > 0) {
                var index = Math.floor(Math.random() * continentResults.match_count);
                cb(continentResults.matches[index]);
            } else {
                cb(null);
            }
        }
    });
});

chatbot.addGetActivityHandler(function(sessionId, cb, parameters) {
    var explorer = new LocationExplorer(sessionId);
    explorer.SearchActivities(function(error, data) {
        if (error) {
            console.log(error);
            cb(null);
        } else {
            var continentResults = data[parameters.continent];
            if (continentResults && continentResults.match_count > 0) {
                var index = Math.floor(Math.random() * continentResults.match_count);
                cb(continentResults.matches[index]);
            } else {
                cb(null);
            }
        }
    });
});

chatbot.addGetMediaHandler(function(sessionId, cb, parameters) {
    var explorer = new LocationExplorer(sessionId);
    explorer.SearchMedia(function(error, data) {
        if (error) {
            console.log(error);
            cb(null);
        } else {
            var continentResults = data[parameters.continent];
            if (continentResults && continentResults.match_count > 0) {
                var index = Math.floor(Math.random() * continentResults.match_count);
                cb(continentResults.matches[index]);
            } else {
                cb(null);
            }
        }
    });
});

chatbot.addGetVolunteerOrgHandler(function(sessionId, cb, parameters) {
    var explorer = new LocationExplorer(sessionId);
    explorer.SearchVolunteerOrganizations(function(error, data) {
        if (error) {
            console.log(error);
            cb(null);
        } else {
            var continentResults = data[parameters.continent];
            if (continentResults && continentResults.match_count > 0) {
                var index = Math.floor(Math.random() * continentResults.match_count);
                cb(continentResults.matches[index]);
            } else {
                cb(null);
            }
        }
    });
});

chatbot.addGetAttractionHandler(function(sessionId, cb, parameters) {
    var explorer = new LocationExplorer(sessionId);
    explorer.SearchTouristAttractions(function(error, data) {
        if (error) {
            console.log(error);
            cb(null);
        } else {
            var continentResults = data[parameters.continent];
            if (continentResults && continentResults.match_count > 0) {
                var index = Math.floor(Math.random() * continentResults.match_count);
                cb(continentResults.matches[index]);
            } else {
                cb(null);
            }
        }
    });
});

chatbot.addSetFeatureHandler(function(sessionId, cb, parameters) {
    database.tables.sessions.AddChatConcepts(sessionId, [parameters.feature], function (error) {
        //Log any errors
        if (error) {
            console.log(error);
        }
    });
    database.tables.sessions.AddChatKeywords(sessionId, [parameters.feature], function(error) {
        //Log any errors
        if (error) {
            console.log(error);
        }
    });
    cb(null);
});

//Initialize passport
var session = require("express-session"),
    bodyParser = require("body-parser");

/**
    "Request" : {
        "session_id" : ""
    }

    "Response" : {
        "africa" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
        "europe" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
        "asia" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
        "north_america" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
        "south_america" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
        "australia" : {
            "match_count": COUNT,
            matches: [
                {
                    "id" : "LOCATION_ID",
                    "location" : "LOCATION_STRING",
                    "description" : "LOCATION_DESCRIPTION", 
                    "confidence" : "CONFIDENCE_VALUE"
                }
            ]
        }
    }
 */
express.post('/match', (req, res) => {
    var sessionId = req.body.session_id;

    //Determine whether the request is malformed
    if (typeof(sessionId) != 'undefined') {
        var explorer = new LocationExplorer(sessionId);
        explorer.SearchDestinations(function (error, data) {
            if (error) {
                res.send(JSON.stringify({
                    africa: {
                        match_count: 0,
                        matches: []
                    },
                    europe: {
                        match_count: 0,
                        matches: []
                    },
                    asia: {
                        match_count: 0,
                        matches: []
                    }, 
                    north_america: {
                        match_count: 0,
                        matches: []
                    }, 
                    south_america: {
                        match_count: 0,
                        matches: []
                    }, 
                    australia: {
                        match_count: 0,
                        matches: []
                    }
                }));
            } else {
                res.send(JSON.stringify(data));
            }
        })
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
    console.log(input);

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

                if (input != null) {
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
                            var concepts = conceptExtractor.GetConcepts(0.85);
                            var keywords = keywordExtractor.GetKeywords(0.50);
                            var entities = entityExtractor.GetEntities();
                            //Determine whether any concepts were found 
                            if (concepts.length > 0) {
                                console.log("Concepts Detected: " + concepts);
                                //Associate these concepts with this user session
                                database.tables.sessions.AddChatConcepts(chatbotData.sessionId, concepts, function (error) {
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
                                database.tables.sessions.AddChatKeywords(chatbotData.sessionId, keywords, function(error) {
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
                                database.tables.sessions.AddChatEntities(chatbotData.sessionId, entities, function(error) {
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
    var userToken = req.body.token;
    var sessionID = req.body.session_id;
    //var userToken = 'EAACEdEose0cBAJe2EDMcUk5C7UlY1k2a3SR3yoIj5aJZAPkKcQhxODHGmtPOf29SNustjj5yKaQnGLz47kMShQyE7T1341iWbYrqy8nJpTReUGeCaZBZCPEWR9ZAMbtbN2gAEySFzo8ZBP4c7R2ziAuagXdKRiRb2kHsONHX92PuizIOlAItsPut4WAcpu2WcYF9ZBbE6IDAZDZD'
    //var sessionID = 0;
    //url = 'https://graph.facebook.com/me/posts'
    //Authorize with access token
    FB.setAccessToken(userToken);
    //Get posts
    FB.api('me/posts', { access_token: userToken }, function(fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
        } else {
            res.send(JSON.stringify({
                success: true
            }));
            var postsArray = fbRes.data;
            console.log(postsArray)
            GetConceptsFromPosts(postsArray,sessionID);
            console.log(fbRes.data);
        }
    });
});

express.post('/facebookresults', function (req, res) {
    console.log("Getting facebook results...");
    var sessionId = req.body.session_id;

    if (typeof (sessionId) != 'undefined') {
        //Search the database for the supplied session information
        database.tables.sessions.GetItem(sessionId, function (err, data) {
            //Determine whether there was an internal error
            if (err || typeof (data) === 'undefined') {
                if (err) {
                    console.log(err);
                }
                res.send(JSON.stringify({
                    concepts: [],
                    keywords: [],
                    entities: []
                }));
            } else {
                //Respond with the matching location data
                res.send(JSON.stringify({
                    concepts: data.FacebookConcepts ? data.FacebookConcepts.values : [],
                    keywords: data.FacebookKeywords ? data.FacebookKeywords.values : [],
                    entities: data.FacebookEntities ? data.FacebookEntities.values : []
                }));
            }
        });
    } else {
        //Throw an error if the request was malformed
        console.log("Malformed request");
        res.status(400).send("ERROR: Bad request");
    }
});

//Serve static frontend
express.use(Express.static('public'));

//Get the correct port from the environment variables
var port = process.env.PORT;

//Uncomment to test on localhost, port 8000
//var port = 8000;

//Start the server
server.listen(port, () => {
    console.log("Access on Android Server bound on port: " + port.toString());
});

function GetConceptsFromPosts(postsArray, sessionID) {
    var concatPosts = "";
    for (var i = 0; i < postsArray.length; i++) {
        var singlePost = postsArray[i];
        if (singlePost.hasOwnProperty('message')) {
            concatPosts = concatPosts + " / " + singlePost.message
        }
    }
    var analyzer = new TextAnalyzer(concatPosts);
    var conceptExtractor = new analyzer.ConceptExtractor(); //Extract concepts
    var keywordExtractor = new analyzer.KeywordExtractor(); //Extract keywords
    var entityExtractor = new analyzer.EntityExtractor(); //Extract entities

    analyzer.Analyze(function (err) {
        //Check for analysis error
        if (err) {
            console.log(err);
        } else {
            //Store the concepts that were found
            var concepts = conceptExtractor.GetConcepts(0.85);
            var keywords = keywordExtractor.GetKeywords(0.50);
            var entities = entityExtractor.GetEntities();
            //Determine whether any concepts were found
            if (concepts.length > 0) {
                console.log("Concepts Detected: " + concepts);
                //Associate these concepts with this user session
                database.tables.sessions.AddFacebookConcepts(sessionID, concepts, function (error) {
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
                database.tables.sessions.AddFacebookKeywords(sessionID, keywords, function (error) {
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
                database.tables.sessions.AddFacebookEntities(sessionID, entities, function (error) {
                    //Log any errors
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    });
}
