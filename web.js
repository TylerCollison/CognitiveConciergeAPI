"use strict";

const http = require("http");
const Express = require("express");
const bp = require("body-parser");
const ChatBot = require("./ChatBot/WatsonConversation");
const TextAnalyzer = require("./Analysis/WatsonTextAnalyzer");
const Database = require("./Database/database");
const LocationExplorer = require("./KnowledgeSystem/LocationExplorer");
const FB = require('fb');
const request = require('request');
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

// enable cors
var cors = require('cors')

var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
express.use(cors(corsOption));
	
//Initialize twitter
var Twitter = require('twitter');

var twitterClient = new Twitter({
  consumer_key: 'HW2YG8w5MwTFXVjHv6D9XTTLA',
  consumer_secret: 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi',
  access_token_key: ' 976868791874408448-TMNBEf3qyWOk3wF9Sr0iyDBWqRs3gny',
  access_token_secret: 'wrmuZX76XXVx1lf0XGon6L7h2SnchRvYzcdWb4ZVn8pKd'
});


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
                if (err) {
                    console.log(err);
                }
                res.send(JSON.stringify({
                    match_count: 0, 
                    matches: []
                }));
            } else {
                var explorer = new LocationExplorer(); //Create a new location explorer
                //Determine whether there are any concepts associated with the session
                if (data.ChatConcepts) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchConcepts(data.ChatConcepts.values); //Add the concepts 
                }
                //Determine whether there are any keywords associated with the session
                if (data.ChatKeywords) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchKeywords(data.ChatKeywords.values); //Add the keywords 
                }
                //Determine whether there are any entities associated with the session
                if (data.ChatEntities) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchEntities(data.ChatEntities.values); //Add the entities 
                }
                //Determine whether there are any concepts associated with the session
                if (data.FacebookConcepts) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchConcepts(data.FacebookConcepts.values); //Add the concepts 
                }
                //Determine whether there are any keywords associated with the session
                if (data.FacebookKeywords) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchKeywords(data.FacebookKeywords.values); //Add the keywords 
                }
                //Determine whether there are any entities associated with the session
                if (data.FacebookEntities) {
                    //TODO: remove the Concept Set at the database level
                    explorer.AddSearchEntities(data.FacebookEntities.values); //Add the entities 
                }
				if (data.TwitterConcepts) {
                    explorer.AddSearchConcepts(data.TwitterConcepts.values); //Add the concepts
                }
				if (data.TwitterKeywords) {
                    explorer.AddSearchKeywords(data.TwitterKeywords.values); //Add the keywords
                }
				if (data.TwitterEntities) {
                    explorer.AddSearchEntities(data.TwitterEntities.values); //Add the entities 
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
                            var concepts = conceptExtractor.GetConcepts();
                            var keywords = keywordExtractor.GetKeywords();
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

//Get the correct port from the environment variables
//var port = process.env.PORT;

//Uncomment to test on localhost, port 8000
var port = 8000;

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
            var concepts = conceptExtractor.GetConcepts();
            var keywords = keywordExtractor.GetKeywords();
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

function GetConceptsFromTweets(postsArray, sessionID) {
    var concatPosts = "";
    for (var i = 0; i < postsArray.length; i++) {
        var singlePost = postsArray[i];
        if (singlePost.hasOwnProperty('text')) {
            concatPosts = concatPosts + " / " + singlePost.text
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
            var concepts = conceptExtractor.GetConcepts();
            var keywords = keywordExtractor.GetKeywords();
            var entities = entityExtractor.GetEntities();
            //Determine whether any concepts were found
            if (concepts.length > 0) {
                console.log("Concepts Detected: " + concepts);
                //Associate these concepts with this user session
                database.tables.sessions.AddTwitterConcepts(sessionID, concepts, function (error) {
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
                database.tables.sessions.AddTwitterKeywords(sessionID, keywords, function (error) {
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
                database.tables.sessions.AddTwitterEntities(sessionID, entities, function (error) {
                    //Log any errors
                    if (error) {
                        console.log(error);
                    }
                });
            }
        }
    });
}

express.post('/twitterresults', function (req, res) {
    console.log("Getting twitter results...");
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
                    concepts: data.TwitterConcepts ? data.TwitterConcepts.values : [],
                    keywords: data.TwitterKeywords ? data.TwitterKeywords.values : [],
                    entities: data.TwitterEntities ? data.TwitterEntities.values : []
                }));
            }
        });
    } else {
        //Throw an error if the request was malformed
        console.log("Malformed request");
        res.status(400).send("ERROR: Bad request");
    }

});

express.post('/analyzetwitter', function (req, res){
	console.log("Getting twitter results...");
	//Get userToken and sessionID from the client
    var userToken = req.body.token;
    var sessionID = req.body.session_id;
	var UserID = 'NotARealName543'
	
	console.log("Calling analyzetwitter")
    //Get tweets
    twitterClient.get('statuses/user_timeline', {q: 'node.js', screen_name:UserID}, function(error, result, response) {
        if (!response || error) {
            console.log(!result ? 'error occurred' : error);
        } else {
            res.send(JSON.stringify({
                success: true
            }));
			COnsole.log(result.data)
            var postsArray = result.data;
            console.log(postsArray)
            GetConceptsFromTweets(postsArray,sessionID);
            
			//Try some pagination stuff. First API call runs without a cursor parameter. If it is not paginated, rerun the api call until there is no pages(cursor is null)
			var current_cursor = result.next_cursor
			while(!current_cursor){
				twitterClient.get('statuses/home_timeline', {q: 'node.js',cursor:current_cursor}, function(error, result, response) {
					if (!response || error) {
						console.log(!fbRes ? 'error occurred' : error);
					} else {
						res.send(JSON.stringify({
							success: true
					}));
					current_cursor = result.next_cursor
					postsArray = result.data;
					console.log(postsArray)
					GetConceptsFromTweets(postsArray,sessionID);
					}
				});
			}
		}
	});
});
	

/*
/Code to initialize passport using twitter strategy
*/
'use strict';

var passport = require('passport');
  TwitterTokenStrategy = require('passport-twitter-token'),

module.exports = function () {

  passport.use(new TwitterTokenStrategy({
      consumerKey: 'HW2YG8w5MwTFXVjHv6D9XTTLA',
      consumerSecret: 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi',
      includeEmail: true
    },
    function (sessionId, token, tokenSecret, profile, done) {
		database.tables.sessions.AddTwitterUserEmail(sessionId, profile, function(error){
		if (error) {
			console.log(error);
			}
		});
		
		database.tables.sessions.AddTwitterUserID(sessionId, profile, function(error){
		if (error) {
			console.log(error);
			}
		});
		
		database.tables.sessions.AddTwitterUserToken(sessionId, token, function(error){
		if (error) {
			console.log(error);
			}
		});
		
		database.tables.sessions.AddTwitterUserSecret(sessionId, tokenSecret, function(error){
		if (error) {
			console.log(error);
			}
		});
      
    }));

};

/**
	Token creation
*/

var TwitterTokenStrategy = require('passport-twitter-token');

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

var expressJwt = require('express-jwt');

//token handling middleware
var authenticate = expressJwt({
  secret: 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi',
  requestProperty: 'auth',
  getToken: function(req) {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

//Routes

  express.post('/auth/twitter/reverse', function(req, res) {
	  console.log("Calling twitter reverse")
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
        consumer_key: 'HW2YG8w5MwTFXVjHv6D9XTTLA',
        consumer_secret: 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi'
      }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }

      var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
	  console.log(JSON.parse(jsonStr))
      res.send(JSON.parse(jsonStr));
    });
});

  express.post('/auth/twitter', (req, res, next) => {
	  console.log("Calling auth twitter")
    request.post({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: 'HW2YG8w5MwTFXVjHv6D9XTTLA',
        consumer_secret: 'XF5YFPEWffk8uFa6ERuEWwzPC8xkFuMguBq3Pc74bnuZgIGoKi',
        token: req.query.oauth_token
      },
      //form: { oauth_verifier: req.query.oauth_verifier }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }

      console.log(body);
      const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      const parsedBody = JSON.parse(bodyString);

      req.body['oauth_token'] = parsedBody.oauth_token;
      req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
      req.body['user_id'] = parsedBody.user_id;

      next();
    });
  }, passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }

      // prepare token for API
      req.auth = {
        id: req.user.id
      };

      return next();
}, generateToken, sendToken);