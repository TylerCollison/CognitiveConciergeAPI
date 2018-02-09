const NLU = require("watson-developer-cloud/natural-language-understanding/v1");

const USERNAME = "11adc617-f9aa-46f9-93e0-026f692c41e8";
const PASSWORD = "sCuXbPVlye6D";
const CONFIDENCE = 0.5;

function CreateAnalyzer() {
    return natural_language_understanding = new NLU({
        'username': USERNAME,
        'password': PASSWORD,
        'version_date': '2017-02-27'
    });
}

class TextAnalyzer {
    constructor(text) {
        var analyzer = this;
        this.client = CreateAnalyzer();
        this.params = {
            text: text, 
            features: {}
        }

        this.ConceptExtractor = class ConceptExtractor {
            constructor() {
                analyzer.AddConceptAnalysis();
            }

            GetConcepts(relevance) {
                var result = [];
                var rawConcepts = analyzer.analysis.concepts;
                for (var concept in rawConcepts) {
                    if (relevance) {
                        if (rawConcepts[concept].relevance >= relevance) {
                            result.push(rawConcepts[concept].text);
                        }
                    } else {
                        result.push(rawConcepts[concept].text);
                    }
                }
                return result;
            }
        }
    }

    AddConceptAnalysis() {
        this.params.features.concepts = {}
    }

    AddCategoryAnalysis() {
        this.params.features.categories = {}
    }

    AddEmotionalAnalysis(targets) {
        this.params.features.emotion = {}
        if (targets) {
            this.params.features.emotion = {
                targets: targets
            }
        }
    }

    AddEntityAnalysis(emotion, sentiment, mentions) {
        this.params.features.entities = {
            emotion: emotion, 
            sentiment: sentiment, 
            mentions: mentions
        }
    }

    AddKeywordAnalysis(emotion, sentiment) {
        this.params.features.keywords = {
            emotion: emotion, 
            sentiment: sentiment
        }
    }

    AddSentimentAnalysis(targets) {
        this.params.features.sentiment = {}
        if (targets) {
            this.params.features.sentiment = {
                targets: targets
            }
        }
    }

    Analyze(cb) {
        var self = this;
        this.client.analyze(this.params, function(error, response) {
            if (error) {
                cb(error, null);
            } else {
                delete response.usage;
                delete response.language;
                self.analysis = response;
                cb(error, response);
            }
        });
    }
}

module.exports = TextAnalyzer;