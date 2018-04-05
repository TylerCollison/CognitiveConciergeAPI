const LocationExplorer = require("./ContinentLocationExplorer");
const Database = require("../Database/database");

function buildExplorer(sessionId, callback) {
    //Get the database instance
    var database = Database.GetInstance();
    //Search the database for the supplied session information
    database.tables.sessions.GetItem(sessionId, function(err, data) {
        //Determine whether there was an internal error
        if (err || typeof(data) === 'undefined') {
            callback(true, null);
        } else {
            var explorer = new LocationExplorer();
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
            callback(null, explorer);
        }
    });
}

/**
 * Searches for location information using supplied query information
 */
class DynamoContinentExplorer {
    constructor(sessionId) {
        this.sessionId = sessionId;
    }

    /**
     * Search for locations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    SearchDestinations(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchDestinations(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }

    /**
     * Search for points of interest using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    SearchPointsOfInterest(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchPointsOfInterest(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }

    /**
     * Search for activities using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchActivities(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchActivities(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }

    /**
     * Search for media using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchMedia(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchMedia(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }

    /**
     * Search for volunteer organizations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchVolunteerOrganizations(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchVolunteerOrganizations(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }

    /**
     * Search for tourist attractions using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchTouristAttractions(callback) {
        buildExplorer(this.sessionId, function(error, explorer) {
            if (error) {
                callback(error, null);
            } else {
                //Search based on the supplied parameters
                explorer.SearchTouristAttractions(function(err, data) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(err, data);
                    }
                });
            }
        });
    }
}

module.exports = DynamoContinentExplorer;