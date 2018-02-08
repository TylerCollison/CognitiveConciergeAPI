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
}

module.exports = Database;