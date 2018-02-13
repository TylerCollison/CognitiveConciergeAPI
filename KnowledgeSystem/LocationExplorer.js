const KnowledgeBase = require("./KnowledgeBase");
const cryptoEngine = require("../Cryptography/cryptoEngine");

const CONCEPT_IDENTIFIER = "enriched_text.concepts.text";
const ENTITY_IDENTIFIER = "enriched_text.entities.text";
const KEYWORD_IDENTIFIER = "enriched_text.keywords.text";

const AGGREGATOR = "[nested(enriched_text.entities).filter(enriched_text.entities.type::\"Location\",enriched_text.entities.disambiguation.subtype::!\"Continent\").term(enriched_text.entities.text,count:10).term(enriched_text.entities.disambiguation.name,count:1),nested(enriched_text.entities).filter(enriched_text.entities.type::\"GeographicFeature\").term(enriched_text.entities.text,count:10).term(enriched_text.entities.disambiguation.name,count:1)]";
const FILTER = "enriched_text.sentiment.document.label::!\"negative\",enriched_text.entities.type:\"Location\"";

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
            result = result +  key + ":(" + value + "),"; //Insert the query term and arguments into the query string
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
function ExtractResults(response) {
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
                    description: "Description not available", //TODO: replace this with meaningful data
                    confidence: 0.0 //TODO: replace this with meaningful confidence
                });
            } else {
                //If not, use the extracted name
                results.push({
                    id: cryptoEngine.hashPassword(originalResults[j].key, ""), //Generate a unique ID
                    location: originalResults[j].key, 
                    description: "Description not available", //TODO: replace this with meaningful data
                    confidence: 0.0 //TODO: replace this with meaningful confidence
                });
            }
        }
    }
    return results;
}

/**
 * Searches for location information using supplied query information
 */
class LocationExplorer {
    constructor() {
        this.client = KnowledgeBase.GetInstance();
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
            this.queryMap[CONCEPT_IDENTIFIER] = this.queryMap[CONCEPT_IDENTIFIER] + "\"" + concepts[i] + "\",";
        }
    }

    /**
     * Add entities to be used as part of the search
     * @param {Array of entities to be added} entities 
     */
    AddSearchEntities(entities) {
        for (var i = 0; i < entities.length; i++) {
            this.queryMap[ENTITY_IDENTIFIER] = this.queryMap[ENTITY_IDENTIFIER] + "\"" + entities[i] + "\",";
        }
    }

    /**
     * Add keywords to be used as part of the search
     * @param {Array of keywords to be added} keywords 
     */
    AddSearchKeywords(keywords) {
        for (var i = 0; i < keywords.length; i++) {
            this.queryMap[KEYWORD_IDENTIFIER] = this.queryMap[KEYWORD_IDENTIFIER] + "\"" + keywords[i] + "\",";
        }
    }

    /**
     * Search for locations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    Search(callback) {
        var queryString = GenerateQueryString(this.queryMap); //Generate the appropriate query string
        //Query the knowledge base for aggregation
        this.client.Query(queryString, 0, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, ExtractResults(data));
            }
        }, null, FILTER, AGGREGATOR);
    }
}

module.exports = LocationExplorer;