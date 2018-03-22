const TABLE_NAME = "CognitiveConciergeSessions";

class SessionsTable {
    constructor(database) {
        this.client = database;
    }

    /**
     * Get the item with the specified primary key from the table
     * @param {The primary key of the target item} primaryKeyValue 
     * @param {Callback function called once a response is received; has two parameter: error and data, where error contains any error information and data contains the target item} callback 
     */
    GetItem(primaryKeyValue, callback) {
        this.client.GetItem(TABLE_NAME, {
            SessionID: primaryKeyValue
        }, callback);
    }

    /**
     * Scan this table with the specified filter
     * @param {Filter object with which to search for items in the database} filter 
     * @param {Callback function called at the conclusion of the scan; has two parameters: error and data, where error contains any error information and data is a list of resulting items} callback 
     */
    Scan(filter, callback) {
        this.client.Scan(TABLE_NAME, filter, callback);
    }

    /**
     * Put the specified item into this table
     * @param {The item to place into this table} item 
     * @param {Callback function called at the conclusion of the put; has one parameter: error, which contains any error information} callback 
     */
    PutItem(item, callback) {
        this.client.PutItem(TABLE_NAME, item, callback);
    }

    /**
     * Update the specified item in this table, or create the item if it does not exist
     * @param {The primary key of the item to be updated} primaryKeyValue 
     * @param {The object from which to update the item in the table} update 
     * @param {Callback function called at the conclusion of the update; has one parameter: error, which contains any error information} callback 
     */
    UpdateItem(primaryKeyValue, update, callback) {
        this.client.UpdateItem(TABLE_NAME, {
            SessionID: primaryKeyValue
        }, update, callback);
    }

    /**
     * Add a list of concepts to a session
     * @param {The ID of the session to add the concepts to} sessionId 
     * @param {The concepts to add to the session} concepts 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddChatConcepts(sessionId, concepts, callback) {
        this.UpdateItem(sessionId, { ChatConcepts: concepts }, callback);
    }

    /**
     * Add a list of keywords to a session
     * @param {The ID of the session to add the keywords to} sessionId 
     * @param {The keywords to add to the session} keywords 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddChatKeywords(sessionId, keywords, callback) {
        this.UpdateItem(sessionId, { ChatKeywords: keywords }, callback);
    }

    /**
     * Add a list of entities to a session
     * @param {The ID of the session to add the entities to} sessionId 
     * @param {The entities to add to the session} entities 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddChatEntities(sessionId, entities, callback) {
        this.UpdateItem(sessionId, { ChatEntities: entities }, callback);
    }

    /**
     * Add a list of concepts to a session
     * @param {The ID of the session to add the concepts to} sessionId 
     * @param {The concepts to add to the session} concepts 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddFacebookConcepts(sessionId, concepts, callback) {
        this.UpdateItem(sessionId, { FacebookConcepts: concepts }, callback);
    }

    /**
     * Add a list of keywords to a session
     * @param {The ID of the session to add the keywords to} sessionId 
     * @param {The keywords to add to the session} keywords 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddFacebookKeywords(sessionId, keywords, callback) {
        this.UpdateItem(sessionId, { FacebookKeywords: keywords }, callback);
    }

    /**
     * Add a list of entities to a session
     * @param {The ID of the session to add the entities to} sessionId 
     * @param {The entities to add to the session} entities 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddFacebookEntities(sessionId, entities, callback) {
        this.UpdateItem(sessionId, { FacebookEntities: entities }, callback);
    }

    /**
     * Add a list of concepts to a session
     * @param {The ID of the session to add the concepts to} sessionId 
     * @param {The concepts to add to the session} concepts 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddTwitterConcepts(sessionId, concepts, callback) {
        this.UpdateItem(sessionId, { TwitterConcepts: concepts }, callback);
    }

    /**
     * Add a list of keywords to a session
     * @param {The ID of the session to add the keywords to} sessionId 
     * @param {The keywords to add to the session} keywords 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddTwitterKeywords(sessionId, keywords, callback) {
        this.UpdateItem(sessionId, { TwitterKeywords: keywords }, callback);
    }

    /**
     * Add a list of entities to a session
     * @param {The ID of the session to add the entities to} sessionId 
     * @param {The entities to add to the session} entities 
     * @param {Callback function called at the conclusion of adding the concepts; has one parameter: error, which contains any error information} callback 
     */
    AddTwitterEntities(sessionId, entities, callback) {
        this.UpdateItem(sessionId, { TwitterEntities: entities }, callback);
    }
}

module.exports = SessionsTable;