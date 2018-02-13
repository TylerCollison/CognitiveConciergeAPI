const KnowledgeBase = require("./KnowledgeBase");
const cryptoEngine = require("../Cryptography/cryptoEngine");

const CONCEPT_IDENTIFIER = "enriched_text.concepts.text";
const ENTITY_IDENTIFIER = "enriched_text.entities.text";
const KEYWORD_IDENTIFIER = "enriched_text.keywords.text";

const AGGREGATOR = "[nested(enriched_text.entities).filter(enriched_text.entities.type::\"Location\",enriched_text.entities.disambiguation.subtype::!\"Continent\").term(enriched_text.entities.text,count:10).term(enriched_text.entities.disambiguation.name,count:1),nested(enriched_text.entities).filter(enriched_text.entities.type::\"GeographicFeature\").term(enriched_text.entities.text,count:10).term(enriched_text.entities.disambiguation.name,count:1)]";
const FILTER = "enriched_text.sentiment.document.label::!\"negative\",enriched_text.entities.type:\"Location\"";

function GenerateQueryString(queryMap) {
    var result = "";
    for (var key in queryMap) {
        if (queryMap[key] != "") {
            var value = queryMap[key].substr(0, queryMap[key].length - 1);
            result = result +  key + ":(" + value + "),";
        }
    }
    return result.substr(0, result.length - 1);
}

function ExtractResults(response) {
    var results = [];
    var aggregations = response.aggregations;
    for (var i = 0; i < aggregations.length; i++) {
        var originalResults = aggregations[i].aggregations[0].aggregations[0].results;
        for (var j = 0; j < originalResults.length; j++) {
            var disambiguationNames = originalResults[j].aggregations[0].results;
            if (disambiguationNames.length > 0) {
                results.push({
                    id: cryptoEngine.hashPassword(disambiguationNames[0].key, ""),
                    location: disambiguationNames[0].key, 
                    description: "Description not available",
                    confidence: 1.0
                });
            } else {
                results.push({
                    id: cryptoEngine.hashPassword(originalResults[j].key, ""),
                    location: originalResults[j].key, 
                    description: "Description not available",
                    confidence: 1.0
                });
            }
        }
    }
    return results;
}

class LocationExplorer {
    constructor() {
        this.client = KnowledgeBase.GetInstance();
        this.queryMap = {};
        this.queryMap[CONCEPT_IDENTIFIER] = "";
        this.queryMap[ENTITY_IDENTIFIER] = "";
        this.queryMap[KEYWORD_IDENTIFIER] = "";
    }

    AddSearchConcepts(concepts) {
        for (var i = 0; i < concepts.length; i++) {
            this.queryMap[CONCEPT_IDENTIFIER] = this.queryMap[CONCEPT_IDENTIFIER] + "\"" + concepts[i] + "\",";
        }
    }

    AddSearchEntities(entities) {
        for (var i = 0; i < entities.length; i++) {
            this.queryMap[ENTITY_IDENTIFIER] = this.queryMap[ENTITY_IDENTIFIER] + "\"" + entities[i] + "\",";
        }
    }

    AddSearchKeywords(keywords) {
        for (var i = 0; i < keywords.length; i++) {
            this.queryMap[KEYWORD_IDENTIFIER] = this.queryMap[KEYWORD_IDENTIFIER] + "\"" + keywords[i] + "\",";
        }
    }

    Search(callback) {
        var queryString = GenerateQueryString(this.queryMap);
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