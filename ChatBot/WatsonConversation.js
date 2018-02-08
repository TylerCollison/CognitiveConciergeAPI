const Conversation = require('watson-developer-cloud/conversation/v1');
const cryptoEngine = require('../Cryptography/cryptoEngine');

const WORKSPACE_ID = 'c3780ca2-72a8-4f39-8b5a-991b1d0f4edf';
const USERNAME = "838ed162-988f-4d49-8b5a-266e5366ac52";
const PASSWORD = "IBzHj72DXkLm";

/**
 * Creates a new Watson Conversation service instance
 * 
 * @return A Watson Conversation service client
 */
function CreateNewConversation() {
    // Set up Conversation service wrapper.
    return conversation = new Conversation({
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
                sessionId: cryptoEngine.encrypt(JSON.stringify(response.context), PASSWORD), //Create session ID from response context
                text: response.output.text[0] //Return the most recent chatbot response
            }
            cb(error, data);
        });
    }
}

module.exports = ChatBot;