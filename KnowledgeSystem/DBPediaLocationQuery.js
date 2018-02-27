const sparql = require("dbpedia-sparql-client").default;

//Store the DBPedia SPARQL query prefix
const queryPrefix = "PREFIX dbo: <http://dbpedia.org/ontology/> SELECT ?resource ?description WHERE { VALUES (?resource) {" 
//Store the DBPedia SPARQL query suffix
const querySuffix = "} ?resource dbo:abstract ?description . FILTER (lang(?description) = 'en') }"

/**
 * Create a resource-to-DBPedia data map from a DBPedia SPARQL response
 * @param {A DBPedia SPARQL response} response 
 * 
 * @return A map of DBPedia resource URLs to DBPedia data objects
 */
function processResponse(response) {
    var result = {}
    //Store the results
    var results = response.results.bindings;
    //Process each result
    for (var i = 0; i < results.length; i++) {
        //Store the resource URL
        var resource = results[i].resource.value;
        //Store the resource description
        var description = results[i].description.value;
        //Add the resource and its data to the result map
        result[resource] = {
            description: description
        }
    }
    return result;
}

/**
 * DBPedia query object for retrieving information about locations on DBPedia
 */
class DBPediaLocationQuery {
    constructor() {
        //Create a new SPARQL client
        this.client = sparql.client();
        //Add the prefix to the query
        this.query = queryPrefix;
    }

    /**
     * Add a resource URL to be used in the query
     * @param {A DBPedia resource URL or a list of such URLs} dbPediaResource 
     */
    AddResource(dbPediaResource) {
        //Determine whether the parameter is a list
        if (dbPediaResource.constructor === Array) {
            //Add each resource in the list to the query
            for (var i = 0; i < dbPediaResource.length; i++) {
                this.AddResource(dbPediaResource[i]);
            }
        } else {
            //Add the resource to the query
            this.query = this.query + "(<" + dbPediaResource + ">) ";
        }
    }

    /**
     * Send the query to DBPedia for response
     * @param {Callback function to be called upon receipt of DBPedia data} cb 
     */
    Send(cb) {
        //Add the suffix to the query
        this.query = this.query + querySuffix;
        //Send the SPARQL query
        this.client.query(this.query).asJson().then(function(data) {
            cb(null, processResponse(data));
        }).catch(function(error) {
            cb(error, null);
        });
    }
}

module.exports = DBPediaLocationQuery;