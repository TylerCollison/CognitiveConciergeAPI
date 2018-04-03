const Conversation = require('watson-developer-cloud/conversation/v1');
const cryptoEngine = require('../Cryptography/cryptoEngine');

const WORKSPACE_ID = "ce837b8e-4b80-473f-b6ab-9c6f9efab88e"; //'d167dec0-a4db-474d-9b35-3b45ba7d563a';
const USERNAME = "59c61159-ea01-451d-a38c-192eae1ee451";//"59c61159-ea01-451d-a38c-192eae1ee451";
const PASSWORD = "eGUEh05mH1Km"; //"eGUEh05mH1Km";

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
        this.actionHandlers = {};
    }

    /**
     * Send a message to the chatbot
     * @param {token used to track the state of the conversation} sessionId 
     * @param {the user input to the chatbot} message 
     * @param {success/error callback with parameters error and data, where data contains a sessionId and text field} cb 
     */
    sendMessage(sessionId, message, cb) {
        var self = this;
        //Send a message to the chatbot
        this.client.message({
            workspace_id: WORKSPACE_ID, //Set the workspace for the chatbot
            input: { text: message }, //Set the user input
            context: ((sessionId != "") ? JSON.parse(cryptoEngine.decrypt(sessionId, PASSWORD)) : { }) //Create context from session ID
        }, function(error, response) {
            if (response) {
                var respond = function() {
                    if (response.context.skip_user_input) {
                        self.sendMessage(cryptoEngine.encrypt(JSON.stringify(response.context), PASSWORD), " ", function(err, data) {
                            //Call callback with response data
                            cb(err, data);
                        });
                    } else {
                        //Call callback with response data
                        var data = {
                            sessionToken: cryptoEngine.encrypt(JSON.stringify(response.context), PASSWORD), //Create session ID from response context
                            text: response.output.text, //Return the most recent chatbot response
                            sessionId: response.context.conversation_id
                        }
                        cb(error, data);
                    }
                }

                //Determine whether there are any attached actions and whether there is a handler map
                if (response.actions && response.actions.length > 0) {
                    var handleActs = function handleActions (actionIndex) {
                        //Handle each action
                        var i = actionIndex;
                        if (i < response.actions.length) {
                            //Get the action handler from the map
                            var handler = self.actionHandlers[response.actions[i].name];
                            //Determine whether there was a handler
                            if (handler) {
                                //Call the handler
                                handler(response.context.conversation_id, function(result) {
                                    response.context[response.actions[i].result_variable] = result;
                                    handleActions(i + 1);
                                }, response.actions[i].parameters);
                            } else {
                                handleActions(i + 1);
                            }
                        } else {
                            respond();
                        }
                    }
                    handleActs(0);
                } else {
                    respond();
                }
            } else {
                cb(error, null);
            }
        });
    }

    /**
     * Set the handler for getChatEntity actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetChatEntityHandler(handler) {
        this.actionHandlers.getChatEntity = handler;
    }

    /**
     * Set the handler for GetChatConcept actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetChatConceptHandler(handler) {
        this.actionHandlers.getChatConcept = handler;
    }

    /**
     * Set the handler for GetChatKeyword actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetChatKeywordHandler(handler) {
        this.actionHandlers.getChatKeyword = handler;
    }

    /**
     * Set the handler for GetFacebookEntity actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetFacebookEntityHandler(handler) {
        this.actionHandlers.getFacebookEntity = handler;
    }

    /**
     * Set the handler for GetFacebookConcept actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetFacebookConceptHandler(handler) {
        this.actionHandlers.getFacebookConcept = handler;
    }

    /**
     * Set the handler for GetFacebookKeyword actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetFacebookKeywordHandler(handler) {
        this.actionHandlers.getFacebookKeyword = handler;
    }

    /**
     * Set the handler for GetTwitterEntity actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetTwitterEntityHandler(handler) {
        this.actionHandlers.getTwitterEntity = handler;
    }

    /**
     * Set the handler for GetTwitterConcept actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetTwitterConceptHandler(handler) {
        this.actionHandlers.getTwitterConcept = handler;
    }

    /**
     * Set the handler for GetTwitterKeyword actions
     * @param {The handler function to be called in response to the action request, which takes a parameter object} handler 
     */
    addGetTwitterKeywordHandler(handler) {
        this.actionHandlers.getTwitterKeyword = handler;
    }

}

module.exports = ChatBot;