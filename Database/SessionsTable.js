const TABLE_NAME = "CognitiveConciergeSessions";
const PRIMARY_KEY_NAME = "SessionID"

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
}

module.exports = SessionsTable;