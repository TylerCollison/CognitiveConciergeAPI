const Conversation = require('watson-developer-cloud/conversation/v1');
const cryptoEngine = require('../Cryptography/cryptoEngine');

const WORKSPACE_ID = 'd167dec0-a4db-474d-9b35-3b45ba7d563a';
const USERNAME = "59c61159-ea01-451d-a38c-192eae1ee451";
const PASSWORD = "eGUEh05mH1Km";

/**
 * Creates a new Watson Conversation service instance
 * 
 * @return A Watson Conversation service client
 */
function CreateNewConversation() {
    // Set up Conversation service wrapper.
    return new Conversation({
        username: USERNAME,
        password: PASSWORD, // replace with service password
        version_date: '2017-05-26'
    });
}

/**
 * Chatbot class that encapsulates communication with a chatbot service
 */
class ChatBot {
    constructor() {
        this.client = CreateNewConversation();
    }

    /**
     * Send a message to the chatbot
     * @param {token used to track the state of the conversation} sessionId 
     * @param {the user input to the chatbot} message 
     * @param {success/error callback with parameters error and data, where data contains a sessionId and text field} cb 
     */
    sendMessage(sessionId, message, cb) {
        //Send a message to the chatbot
        this.client.message({
            workspace_id: WORKSPACE_ID, //Set the workspace for the chatbot
            input: { text: message }, //Set the user input
            context: ((sessionId != "") ? JSON.parse(cryptoEngine.decrypt(sessionId, PASSWORD)) : { }) //Create context from session ID
        }, function(error, response) {
            //Call callback with response data
            var data = {
                sessionToken: cryptoEngine.encrypt(JSON.stringify(response.context), PASSWORD), //Create session ID from response context
                text: response.output.text[0], //Return the most recent chatbot response
                sessionId: response.context.conversation_id
            }
            cb(error, data);
        });
    }
}

module.exports = ChatBot;