var Discovery = require('watson-developer-cloud/discovery/v1');

const ENVIRONMENT_ID = "2e9f9764-ad0d-4f1e-aeab-3382092f2d44";
const COLLECTION_ID = "dd43db89-6a87-462f-8ab9-69c288e96d51";
const USERNAME = "656dc01d-2559-4d36-90f8-6df0b17d8ff4";
const PASSWORD = "yX1lHWcfkFRx";

function CreateKnowledgeBase() {
    return new Discovery({
        username: USERNAME,
        password: PASSWORD,
        version_date: '2017-11-07'
    });
}

function ToArrayString(stringArray) {
    var arrayString = "";
    for (var i = 0; i < stringArray.length; i++) {
        arrayString = arrayString + stringArray[i] + ",";
    }
    return arrayString.substr(0, arrayString.length - 1);
}

class KnowledgeBase {
    constructor() {
        this.client = CreateKnowledgeBase();
    }

    Query(query, count, callback, returnFields, filter, aggregation) {
        var params = {
            environment_id: ENVIRONMENT_ID, 
            collection_id: COLLECTION_ID, 
            query: query, 
            count: count
        }
        if (returnFields) {
            params.return = ToArrayString(returnFields);
        }
        if (filter) {
            params.filter = filter;
        }
        if (aggregation) {
            params.aggregation = aggregation;
        }
        this.client.query(params, callback);
    }
}

//Database singleton
var instance;
function GetInstance() {
    if (!instance) {
        instance = new KnowledgeBase();
    }
    return instance;
}

module.exports.GetInstance = GetInstance;