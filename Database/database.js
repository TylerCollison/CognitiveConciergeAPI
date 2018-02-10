//The AWS SDK
const aws = require("aws-sdk");
const SessionsTable = require("./SessionsTable");

/**
 * Create a new Dynamo DB database instance and return the client
 * 
 * @returns DynamoDB client
 */
function connectToDatabase() {
    // Initialize the Amazon Cognito credentials provider
    aws.config.region = 'us-east-2'; // Region
    aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-2:e747ccc5-4a87-4e54-9a32-142a96d9df2e',
    });
    return new aws.DynamoDB(aws.config.region);
}

/**
 * Construct the parameters needed to perform a scan
 * @param {The name of the table to scan} tableName 
 * @param {The filter specifying the fields and values to search for} filter 
 */
function constructScanParams(tableName, filter) {
    var expressionAttributeValues = {};
    var filterExpression = "";
    for (var key in filter) {
        var expressionKey = ":" + key.toLowerCase();
        expressionAttributeValues[expressionKey] = { S: filter[key] };
        filterExpression = filterExpression + "and contains (" + key + ", " + expressionKey + ")";
    }
    filterExpression = filterExpression.substr(4);
    return {
        ExpressionAttributeValues: expressionAttributeValues,
        FilterExpression: filterExpression,
        TableName: tableName
    }
}

/**
 * Generate an expression string and value map from a Javascript object
 * @param {Base of expression value map} map 
 * @param {Base of expression string} prev 
 * @param {Object from which to generate the expression string} update 
 */
function appendExpression(map, prev, update) {
    var docClient = new aws.DynamoDB.DocumentClient(); //Get an instance of the doc client
    var expression = ""; //Store the expression string for result
    //Iterate over each field of the object
    for (var key in update) {
        //Determine whether the field is an object
        if (typeof(update[key]) === 'object' && update[key].constructor != Array) {
            //Recursively append the child object to the expression string
            var next = appendExpression(map, prev + key + ".", update[key]);
            expression = expression + next.expression; 
        } else {
            var identifier = ":" + prev.toLowerCase().replace(/\./g, "") + key.toLowerCase(); //Create the identifier for the field
            expression = expression + prev + key + " " + identifier + ", "; //Add the field to the expression string
            //Determine whether the field is an array
            if (typeof(update[key] === 'object')) {
                map[identifier] = docClient.createSet(update[key]); //Convert the array to a set and add to the value map
            } else {
                map[identifier] = update[key]; //Add the field to the value map
            }
        }
    }
    //Return the expression string and value map
    return {
        map: map,
        expression: expression
    };
}

/**
 * Generates a full ADD command expression string for the given object
 * @param {The object from which to generate the expression string} update 
 */
function createAddExpression(update) {
    var appendResult = appendExpression({}, "", update); //Serialize the update object
    var expression = "add " + appendResult.expression.substr(0, appendResult.expression.length - 2); //Add command and remove extra comma
    //Return the expression string and value map
    return {
        expressionMap: appendResult.map,
        expression: expression
    }
}

class Database {
    constructor() {
        //Initialize a new DynamoDB client
        this.client = connectToDatabase();
        //Initialize database tables
        this.tables = {
            sessions: new SessionsTable(this)
        }
    }

    /**
     * Gets the specified item from the database
     * @param {The table at which the item is located} tableName 
     * @param {The key associated with the target file} key 
     * @param {Callback function called when a response is received; has two parameters: error and data, where error contains error information and data is the requested item} callback 
     */
    GetItem(tableName, key, callback) {
        var documentClient = new aws.DynamoDB.DocumentClient(); //Get an instance of the document client

        //Setup the GET parameters
        var params = {
            TableName : tableName,
            Key: key
        };

        //Get the item
        documentClient.get(params, function(err, data) {
            //Determine whether an error occurred
            if (err) {
                callback(err, null);
            } else {
                callback(err, data.Item);
            }
        });
    }

    /**
     * Scans a table of a database for items containing the same values as the filter
     * @param {The name of the table to scan} tableName 
     * @param {The filter used to search for items} filter 
     * @param {Callback function called at the conclusion of the scan; has two parameters: error and data, where error contains error information and data is an array of matching items} callback 
     */
    Scan(tableName, filter, callback) {
        //Scan the table with the specified filter
        this.client.scan(constructScanParams(tableName, filter), function(err, data) {
            //Store the modified data
            var modData = {
                Results: []
            }
            //Determine whether an error occurred
            if(!err) {
                //Process each item in the result
                data.Items.forEach(function(element, index, array) {
                    //Convert the item to a proper object
                    var item = {};
                    for (var key in element) {
                        item[key] = element[key].S;
                    }
                    modData.Results.push(item); //Add the item to the results
                });
            }
            callback(err, modData);
        });
    }

    /**
     * Put a new item into the database
     * @param {The table at which to put the new item} tableName 
     * @param {The new item to put into the database} item 
     * @param {Callback function called at the conclusion of the put; has one parameter: error, which contains any error information} callback 
     */
    PutItem(tableName, item, callback) {
        var docClient = new aws.DynamoDB.DocumentClient(); //Get an instance of the document client

        //Setup the PUT parameters
        var params = {
            TableName:tableName,
            Item:item
        };

        //Put the item into the database
        docClient.put(params, function(error, data) {
            callback(error);
        });
    }

    /**
     * Update an item on the database, creating a new item if none already exists
     * @param {The name of the table at which to update the item} tableName 
     * @param {The key associated with the item to update} key 
     * @param {The object from which to update the database item} update 
     * @param {Callback function called at the conclusion of the update; has one parameter: error, which contains any error information} cb 
     */
    UpdateItem(tableName, key, update, cb) {
        var docClient = new aws.DynamoDB.DocumentClient(); //Get the document client

        var updateExpression = createAddExpression(update); //Generate the ADD command expression

        //Setup the UPDATE parameters
        var params = {
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression.expression,
            ExpressionAttributeValues: updateExpression.expressionMap,
        };

        //Update the item in the database
        docClient.update(params, function(err, data) {
            cb(err);
        });
    }
}

//Database singleton
var instance;
function GetInstance() {
    if (!instance) {
        instance = new Database();
    }
    return instance;
}

module.exports.GetInstance = GetInstance;