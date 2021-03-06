const KnowledgeBase = require("./KnowledgeBase");
const cryptoEngine = require("../Cryptography/cryptoEngine");
const DBPediaQuery = require("./DBPediaLocationQuery");

const CONCEPT_IDENTIFIER = "enriched_text.concepts.text";
const ENTITY_IDENTIFIER = "enriched_text.entities.text";
const KEYWORD_IDENTIFIER = "enriched_text.keywords.text";

const DEST_AGGREGATOR = "nested(enriched_text.entities.disambiguation).filter(enriched_text.entities.disambiguation.subtype:(\"Location\"|\"GeographicFeature\"|\"City\"|\"Region\"|\"GovernmentalJurisdiction\"|\"StateOrCountry\"|\"PoliticalDistrict\"|\"BodyOfWater\"|\"USState\"|\"Kingdom\"|\"River\"|\"USCounty\"|\"Island\"|\"Lake\"|\"MountainRange\"|\"CityTown\"|\"Mountain\"|\"IslandGroup\"|\"IndianCity\"),enriched_text.entities.disambiguation.subtype::!(\"Country\"|\"Continent\")).term(enriched_text.entities.disambiguation.dbpedia_resource,count:20).term(enriched_text.entities.disambiguation.name,count:1)";
const POI_AGGREGATOR = "nested(enriched_text.entities).filter(enriched_text.entities.disambiguation.subtype:(\"Sports Facility\"|\"HallOfFame\"|\"Historic Place\"|\"Museum\"|\"Park\"|\"Theater\"|\"ShoppingCenter\")).term(enriched_text.entities.text,count:20)";
const ACT_AGGREGATOR = "nested(enriched_text.entities).filter(enriched_text.entities.type:(\"Hobby\"|\"Sport\")).term(enriched_text.entities.text,count:20)";
const MEDIA_AGGREGATOR = "[nested(enriched_text.entities).filter(enriched_text.entities.disambiguation.subtype:(\"SportsAssociation\"|\"SportsTeam\")).term(enriched_text.entities.text,count:10),nested(enriched_text.entities).filter(enriched_text.entities.disambiguation.subtype:(\"Comedian\"|\"Composer\"|\"Actor\")).term(enriched_text.entities.text,count:10)]";
const VOLUNTEER_AGGREGATOR = "nested(enriched_text.entities).filter(enriched_text.entities.disambiguation.subtype:(\"Non-ProfitOrganisation\")).term(enriched_text.entities.text,count:20)";
const ATTRACTION_AGGREGATOR = "nested(enriched_text.entities).filter(enriched_text.entities.disambiguation.subtype:(\"TouristAttraction\")).term(enriched_text.entities.text,count:20)";

const FILTER = "";

/**
 * Generates the query string used as input into the Watson Discovery Service from the given map
 * @param {Map of Watson Discovery query term to arguments} queryMap 
 * 
 * @return query string representation of the query map
 */
function GenerateQueryString(queryMap) {
    var result = "";
    //Process each query term in the map
    for (var key in queryMap) {
        //Determine whether the term has any arguments
        if (queryMap[key] != "") {
            var value = queryMap[key].substr(0, queryMap[key].length - 1); //Process the query term arguments
            result = result +  key + ":(" + value + ")|"; //Insert the query term and arguments into the query string
        }
    }
    return result.substr(0, result.length - 1); //Removing trailing comma
}

/**
 * Extracts properly formatted location results from the Watson Discovery response
 * @param {Location query response from Watson Discovery} response 
 * 
 * @return {An array of location objects}
 */
function ExtractDestinationResults(response) {
    var results = [];
    //Process each top-level aggregation
    var aggregations = response.aggregations;
    for (var i = 0; i < aggregations.length; i++) {
        var originalResults = aggregations[i].aggregations[0].aggregations[0].results; //Store the results from Watson Discovery
        //Process each Watson Discovery result
        for (var j = 0; j < originalResults.length; j++) {
            //Determine whether the result location has a disambiguation (proper) name
            var disambiguationNames = originalResults[j].aggregations[0].results;
            if (disambiguationNames.length > 0) {
                //If so, use it
                results.push({
                    id: cryptoEngine.hashPassword(disambiguationNames[0].key, ""), //Generate a unique ID
                    location: disambiguationNames[0].key, 
                    description: "No description available", //TODO: replace this with meaningful data
                    dbpedia: originalResults[j].key,
                    confidence: Math.random() //TODO: replace this with meaningful confidence
                });
            }
        }
    }
    return results;
}

/**
 * Extracts properly formatted location results from the Watson Discovery response
 * @param {Location query response from Watson Discovery} response 
 * 
 * @return {An array of location objects}
 */
function ExtractDestinationResultsWithoutAgg(response) {
    var locations = [];
    //Process each document result
    var results = response.results;
    for (var i = 0; i < results.length; i++) {
        var result = results[i]; //Store the result
        //Process each Watson Discovery result
        locations.push({
            id: cryptoEngine.hashPassword(result.id, ""), //Generate a unique ID
            location: ((result.extracted_metadata != null && result.extracted_metadata.title != null) ? result.extracted_metadata.title.replace("- Wikipedia", "") : result.id), 
            description: result.text,
            confidence: result.result_metadata.score //TODO: replace this with meaningful confidence
        });
    }
    return locations;
}

/**
 * Extracts properly formatted entity results from the Watson Discovery response
 * @param {Aggregate entity query response from Watson Discovery} response 
 * 
 * @return {An array of string results}
 */
function ExtractAggregateEntityResults(response) {
    var results = [];
    //Process each top-level aggregation
    var aggregations = response.aggregations;
    for (var i = 0; i < aggregations.length; i++) {
        var originalResults = aggregations[i].aggregations[0].aggregations[0].results; //Store the results from Watson Discovery
        //Process each Watson Discovery result
        for (var j = 0; j < originalResults.length; j++) {
            results.push(originalResults[j].key);
        }
    }
    return results;
}

/**
 * Adds DBPedia data to the location objects in the given list
 * @param {A list of location objects, each with a dbpedia field} locations 
 * @param {Callback function called after adding DBPedia data to the location objects} cb 
 */
function AddDBPediaData(locations, cb) {
    //Create a new DBPedia query
    var dbpediaQuery = new DBPediaQuery();
    //Add each DBPedia location resource to the query
    for (var i = 0; i < locations.length; i++) {
        dbpediaQuery.AddResource(locations[i].dbpedia);
    }
    //Send the query
    dbpediaQuery.Send(function(err, data) {
        //Determine whether there was an error
        if (err) {
            cb(err, null);
        } else {
            //Process each location object
            for (var i = 0; i < locations.length; i++) {
                //Determine whether DBPedia description data was found for the location
                var dbpediaData = data[locations[i].dbpedia];
                if (dbpediaData) {
                    //If so, add it to the object
                    locations[i].description = dbpediaData.description;
                }
            }
            cb(null, locations);
        }
    });
}

/**
 * Searches for location information using supplied query information
 */
class LocationExplorer {
    constructor(environmentId, collectionId, username, password) {
        this.client = new KnowledgeBase(environmentId, collectionId, username, password);
        //Setup query terms
        this.queryMap = {};
        this.queryMap[CONCEPT_IDENTIFIER] = "";
        this.queryMap[ENTITY_IDENTIFIER] = "";
        this.queryMap[KEYWORD_IDENTIFIER] = "";
    }

    /**
     * Add concepts to be used as part of the search
     * @param {Array of concepts to be added} concepts
     */
    AddSearchConcepts(concepts) {
        for (var i = 0; i < concepts.length; i++) {
            this.queryMap[CONCEPT_IDENTIFIER] = this.queryMap[CONCEPT_IDENTIFIER] + "\"" + concepts[i] + "\"|";
        }
    }

    /**
     * Add entities to be used as part of the search
     * @param {Array of entities to be added} entities 
     */
    AddSearchEntities(entities) {
        for (var i = 0; i < entities.length; i++) {
            this.queryMap[ENTITY_IDENTIFIER] = this.queryMap[ENTITY_IDENTIFIER] + "\"" + entities[i] + "\"|";
        }
    }

    /**
     * Add keywords to be used as part of the search
     * @param {Array of keywords to be added} keywords 
     */
    AddSearchKeywords(keywords) {
        for (var i = 0; i < keywords.length; i++) {
            this.queryMap[KEYWORD_IDENTIFIER] = this.queryMap[KEYWORD_IDENTIFIER] + "\"" + keywords[i] + "\"|";
        }
    }

    /**
     * Search for locations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    SearchDestinations(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 10, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                //Add DBPedia data to the results
                var results = ExtractDestinationResultsWithoutAgg(data);
                callback(err, results);
            }
        }, null, FILTER, null);
    }

    /**
     * Search for points of interest using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    SearchPointsOfInterest(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                var results = ExtractAggregateEntityResults(data);
                callback(err, results);
            }
        }, null, FILTER, POI_AGGREGATOR);
    }

    /**
     * Search for activities using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchActivities(callback) {
    var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                var results = ExtractAggregateEntityResults(data);
                callback(err, results);
            }
        }, null, FILTER, ACT_AGGREGATOR);
    }

    /**
     * Search for media using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchMedia(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                var results = ExtractAggregateEntityResults(data);
                callback(err, results);
            }
        }, null, FILTER, MEDIA_AGGREGATOR);
    }

    /**
     * Search for volunteer organizations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchVolunteerOrganizations(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                var results = ExtractAggregateEntityResults(data);
                callback(err, results);
            }
        }, null, FILTER, VOLUNTEER_AGGREGATOR);
    }

    /**
     * Search for tourist attractions using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchTouristAttractions(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                var results = ExtractAggregateEntityResults(data);
                callback(err, results);
            }
        }, null, FILTER, ATTRACTION_AGGREGATOR);
    }
}

module.exports = LocationExplorer;