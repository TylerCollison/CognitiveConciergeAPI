const NLU = require("watson-developer-cloud/natural-language-understanding/v1");

const USERNAME = "11adc617-f9aa-46f9-93e0-026f692c41e8";
const PASSWORD = "sCuXbPVlye6D";

/**
 * Create a new text analyzer instance
 * 
 * @returns Returns a new instance of the text analyzer
 */
function CreateAnalyzer() {
    return new NLU({
        'username': USERNAME,
        'password': PASSWORD,
        'version_date': '2017-02-27'
    });
}

/**
 * Performs Natural Language Processing analysis on text segments
 */
class TextAnalyzer {
    constructor(text) {
        var analyzer = this; //Store the analyzer
        this.client = CreateAnalyzer(); //Store the Watson client
        //Begin constructing the Watson parameter
        this.params = {
            text: text, 
            features: {}
        }

        /**
         * Convenience subclass; Extracts concepts from text using the corresponding TextAnalyzer instance
         */
        this.ConceptExtractor = class ConceptExtractor {
            constructor() {
                analyzer.AddConceptAnalysis(); //Add concept analysis to the analyzer
            }

            /**
             * Retrieve the concepts found through text analysis; must perform analysis before calling this method. 
             * @param {The minimum relevance that a concept must have to be returned} relevance 
             * 
             * @returns returns a list of string concepts; empty if no concepts were found or analysis has not been performed
             */
            GetConcepts(relevance) {
                var result = [];
                var rawConcepts = analyzer.analysis.concepts; //Store the raw concepts from the analyzer
                //Process each concept
                for (var concept in rawConcepts) {
                    //Determine whether the concept is relevant enough
                    if (relevance) {
                        if (rawConcepts[concept].relevance >= relevance) {
                            result.push(rawConcepts[concept].text); //Add the concept to the result
                        }
                    } else {
                        result.push(rawConcepts[concept].text); //Add the concept to the result
                    }
                }
                return result;
            }
        }
    }

    /**
     * Add concept identification to the analysis
     */
    AddConceptAnalysis() {
        this.params.features.concepts = {}
    }

    /**
     * Add category identification to the analysis
     */
    AddCategoryAnalysis() {
        this.params.features.categories = {}
    }

    /**
     * Add emotion identification to the analysis
     * @param {An array of target entities to focus the analysis on} targets 
     */
    AddEmotionalAnalysis(targets) {
        this.params.features.emotion = {}
        if (targets) {
            this.params.features.emotion = {
                targets: targets
            }
        }
    }

    /**
     * Add entity identification to the analysis
     * @param {Boolean indicating whether emotional analysis should be performed on each entity} emotion 
     * @param {Boolean indicating whether sentiment analysis should be performed on each entity} sentiment 
     * @param {Boolean indicating whether the analysis should include example mentions of the entities} mentions 
     */
    AddEntityAnalysis(emotion, sentiment, mentions) {
        this.params.features.entities = {
            emotion: emotion, 
            sentiment: sentiment, 
            mentions: mentions
        }
    }

    /**
     * Add keyword identification to the analysis
     * @param {Boolean indicating whether emotional analysis should be performed on each keyword} emotion 
     * @param {Boolean indicating whether sentiment analysis should be performed on each keyword} sentiment 
     */
    AddKeywordAnalysis(emotion, sentiment) {
        this.params.features.keywords = {
            emotion: emotion, 
            sentiment: sentiment
        }
    }

    /**
     * Add sentiment identification to the analysis
     * @param {An array of target entities on which to focus the analysis} targets 
     */
    AddSentimentAnalysis(targets) {
        this.params.features.sentiment = {}
        if (targets) {
            this.params.features.sentiment = {
                targets: targets
            }
        }
    }

    /**
     * Analyze the text
     * @param {Callback function called at the conclusion of the analysis; has two parameters: error and response, where error contains any error information and response contains analysis data} cb 
     */
    Analyze(cb) {
        var self = this; //Store this
        //Perform NLU analysis through Watson
        this.client.analyze(this.params, function(error, response) {
            //Determine whether there was an error
            if (error) {
                cb(error, null);
            } else {
                //Remove system fields
                delete response.usage;
                delete response.language;
                self.analysis = response; //Store the result
                cb(error, response); //Call the callback
            }
        });
    }
}

module.exports = TextAnalyzer;