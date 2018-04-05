var Discovery = require('watson-developer-cloud/discovery/v1');

// const ENVIRONMENT_ID = "2e9f9764-ad0d-4f1e-aeab-3382092f2d44";
// const COLLECTION_ID = "dd43db89-6a87-462f-8ab9-69c288e96d51";
// const USERNAME = "656dc01d-2559-4d36-90f8-6df0b17d8ff4";
// const PASSWORD = "yX1lHWcfkFRx";

/**
 * Create a new KnowledgeBase instance
 */
function CreateKnowledgeBase(username, password) {
    return new Discovery({
        username: username,
        password: password,
        version_date: '2017-11-07'
    });
}

/**
 * Convert the given array of strings to a comma-separated string representation of the array
 * @param {An array of strings} stringArray 
 */
function ToArrayString(stringArray) {
    var arrayString = "";
    for (var i = 0; i < stringArray.length; i++) {
        arrayString = arrayString + stringArray[i] + ",";
    }
    return arrayString.substr(0, arrayString.length - 1);
}

/**
 * An unstructured, queryable knowledge-base 
 */
class KnowledgeBase {
    constructor(environmentId, collectionId, username, password) {
        this.client = CreateKnowledgeBase(username, password);
        this.environmentId = environmentId;
        this.collectionId = collectionId;
    }

    /**
     * Queries the knowledge base with the given query and options
     * @param {The query string used to search for results} query 
     * @param {The number of documents to return} count 
     * @param {Callback function called when a response is received; has two parameters: error and data, where error contains error information and data is the raw response from the Watson Discovery service} callback 
     * @param {Optional. Specifies an array of a subset of fields to return for each document} returnFields 
     * @param {Optional. Specifies a pre-query filter string used to remove potential results (can be used to improve performance)} filter 
     * @param {Optional. Specifies a post-query aggregation string used to extract results} aggregation 
     */
    Query(query, count, callback, returnFields, filter, aggregation) {
        var params = {
            environment_id: this.environmentId, 
            collection_id: this.collectionId, 
            query: query, 
            count: count
        }
        //Determine whether returnFields was supplied
        if (returnFields) {
            params.return = ToArrayString(returnFields);
        }
        //Determine whether filter was supplied
        if (filter) {
            params.filter = filter;
        }
        //Determine whether aggregation was supplied
        if (aggregation) {
            params.aggregation = aggregation;
        }
        this.client.query(params, callback);
    }
}

module.exports = KnowledgeBase;