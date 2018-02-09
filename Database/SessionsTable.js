const TABLE_NAME = "CognitiveConciergeSessions";

class SessionsTable {
    constructor(database) {
        this.client = database;
    }

    GetItem(primaryKeyValue, callback) {
        this.client.GetItem(TABLE_NAME, {
            SessionID: primaryKeyValue
        }, callback);
    }

    Scan(filter, callback) {
        this.client.Scan(TABLE_NAME, filter, callback);
    }

    PutItem(item, callback) {
        this.client.PutItem(TABLE_NAME, item, callback);
    }

    UpdateItem(primaryKeyValue, update, callback) {
        this.client.UpdateItem(TABLE_NAME, {
            SessionID: primaryKeyValue
        }, update, callback);
    }

    AddConcepts(sessionId, concepts, callback) {
        this.UpdateItem(sessionId, { Concepts: concepts }, callback);
    }
}

module.exports = SessionsTable;