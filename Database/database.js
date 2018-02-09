/**
 * Author: Tyler Collison
 * 
 * This script defines an EmployeeRecordsDatabase class and defines a connectToDatabase method. 
 * The EmployeeRecordsDatabase class is responsible for encapsulating access to the AWS Dynamo DB
 * database, which stores all of the employee records of all users. The connectToDatabase method 
 * connects all instances of the database class to the appropriate Dynamo DB database. 
 */

//The AWS SDK
const aws = require("aws-sdk");
const SessionsTable = require("./SessionsTable");

function connectToDatabase() {
    // Initialize the Amazon Cognito credentials provider
    aws.config.region = 'us-east-2'; // Region
    aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-2:e747ccc5-4a87-4e54-9a32-142a96d9df2e',
    });
    return new aws.DynamoDB(aws.config.region);
}

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

function appendExpression(map, prev, update) {
    var docClient = new aws.DynamoDB.DocumentClient();
    var expression = "";
    for (var key in update) {
        if (typeof(update[key]) === 'object' && update[key].constructor != Array) {
            var next = appendExpression(map, prev + key + ".", update[key]);
            expression = expression + next.expression;
        } else {
            var identifier = ":" + prev.toLowerCase().replace(/\./g, "") + key.toLowerCase();
            expression = expression + prev + key + " " + identifier + ", ";
            if (typeof(update[key] === 'object')) {
                map[identifier] = docClient.createSet(update[key]);
            } else {
                map[identifier] = update[key];
            }
        }
    }
    return {
        map: map,
        expression: expression
    };
}

function createAddExpression(update) {
    var appendResult = appendExpression({}, "", update); //Serialize the update object
    var expression = "add " + appendResult.expression.substr(0, appendResult.expression.length - 2); //Add command and remove extra comma
    return {
        expressionMap: appendResult.map,
        expression: expression
    }
}

class Database {
    constructor() {
        this.client = connectToDatabase();
        this.tables = {
            sessions: new SessionsTable(this)
        }
    }

    GetItem(tableName, key, callback) {
        var documentClient = new aws.DynamoDB.DocumentClient();

        var params = {
            TableName : tableName,
            Key: key
        };

        documentClient.get(params, function(err, data) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, data.Item);
            }
        });
    }

    Scan(tableName, filter, callback) {
        this.client.scan(constructScanParams(tableName, filter), function(err, data) {
            var modData = {
                Results: []
            }
            if(!err) {
                data.Items.forEach(function(element, index, array) {
                    var item = {};
                    for (var key in element) {
                        item[key] = element[key].S;
                    }
                    modData.Results.push(item);
                });
            }
            callback(err, modData);
        });
    }

    PutItem(tableName, item, callback) {
        var docClient = new aws.DynamoDB.DocumentClient();

        var params = {
            TableName:tableName,
            Item:item
        };

        docClient.put(params, function(error, data) {
            callback(error);
        });
    }

    UpdateItem(tableName, key, update, cb) {
        var docClient = new aws.DynamoDB.DocumentClient();

        var updateExpression = createAddExpression(update);
        var params = {
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression.expression,
            ExpressionAttributeValues: updateExpression.expressionMap,
        };

        docClient.update(params, function(err, data) {
            cb(err);
        });
    }
}


var instance;
function GetInstance() {
    if (!instance) {
        instance = new Database();
    }
    return instance;
}

module.exports.GetInstance = GetInstance;