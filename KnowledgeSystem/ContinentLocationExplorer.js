const LocationExplorer = require("./LocationExplorer");

/**
 * Searches for location information using supplied query information
 */
class ContinentLocationExplorer {
    constructor() {
        this.northAmericaExplorer = new LocationExplorer("1ca902f0-21c0-4cbb-94ce-440e067106f5", "b508c338-e5ac-4826-9b8a-b8b366153f87", "a2399677-a1bf-4121-b358-ddff19d8c7a8", "yKCnUBslf5w1");
        this.southAmericaExplorer = new LocationExplorer("3e6bad8d-a45a-4cd3-ab59-b3a31c505f06", "b41bd483-0b78-4f28-a845-9540d018657c", "6d820b63-0997-468e-95f9-3563eabd9068", "vB644KfixGIW");
        this.africaExplorer = new LocationExplorer(" ", " ", " ", " "); //TODO: add Africa discovery credentials
        this.europeExplorer = new LocationExplorer(" ", " ", " ", " "); //TODO: add Europe discovery credentials  
        this.australiaExplorer = new LocationExplorer(" ", " ", " ", " "); //TODO: add Australia discovery credentials
        this.asiaExplorer = new LocationExplorer(" ", " ", " ", " "); //TODO: add Asia discovery credentials
        // environmentId, collectionId, username, password
    }

    /**
     * Add concepts to be used as part of the search
     * @param {Array of concepts to be added} concepts
     */
    AddSearchConcepts(concepts) {
        this.northAmericaExplorer.AddSearchConcepts(concepts);
        this.southAmericaExplorer.AddSearchConcepts(concepts);
        this.africaExplorer.AddSearchConcepts(concepts);
        this.europeExplorer.AddSearchConcepts(concepts);
        this.australiaExplorer.AddSearchConcepts(concepts);
        this.asiaExplorer.AddSearchConcepts(concepts);
    }

    /**
     * Add entities to be used as part of the search
     * @param {Array of entities to be added} entities 
     */
    AddSearchEntities(entities) {
        this.northAmericaExplorer.AddSearchEntities(entities);
        this.southAmericaExplorer.AddSearchEntities(entities);
        this.africaExplorer.AddSearchEntities(entities);
        this.europeExplorer.AddSearchEntities(entities);
        this.australiaExplorer.AddSearchEntities(entities);
        this.asiaExplorer.AddSearchEntities(entities);
    }

    /**
     * Add keywords to be used as part of the search
     * @param {Array of keywords to be added} keywords 
     */
    AddSearchKeywords(keywords) {
        this.northAmericaExplorer.AddSearchKeywords(keywords);
        this.southAmericaExplorer.AddSearchKeywords(keywords);
        this.africaExplorer.AddSearchKeywords(keywords);
        this.europeExplorer.AddSearchKeywords(keywords);
        this.australiaExplorer.AddSearchKeywords(keywords);
        this.asiaExplorer.AddSearchKeywords(keywords);
    }

    /**
     * Search for locations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    Search(callback) {
        var result = {
            africa: {
                match_count: 0,
                matches: []
            },
            europe: {
                match_count: 0,
                matches: []
            },
            asia: {
                match_count: 0,
                matches: []
            }, 
            north_america: {
                match_count: 0,
                matches: []
            }, 
            south_america: {
                match_count: 0,
                matches: []
            }, 
            australia: {
                match_count: 0,
                matches: []
            }
        }
        var self = this;
        self.africaExplorer.Search(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.Search(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.Search(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.Search(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.Search(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.Search(function(ozError, ozData) {
                                if (ozError) {
                                    console.log(ozError);
                                } else {
                                    result.australia = {
                                        match_count: ozData.length,
                                        matches: ozData
                                    }
                                }
                                callback(null, result);
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = ContinentLocationExplorer;