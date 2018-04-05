const LocationExplorer = require("./LocationExplorer");

/**
 * Searches for location information using supplied query information
 */
class ContinentLocationExplorer {
    constructor() {
        this.northAmericaExplorer = new LocationExplorer("1ca902f0-21c0-4cbb-94ce-440e067106f5", "b508c338-e5ac-4826-9b8a-b8b366153f87", "a2399677-a1bf-4121-b358-ddff19d8c7a8", "yKCnUBslf5w1");
        this.southAmericaExplorer = new LocationExplorer("3e6bad8d-a45a-4cd3-ab59-b3a31c505f06", "b41bd483-0b78-4f28-a845-9540d018657c", "6d820b63-0997-468e-95f9-3563eabd9068", "vB644KfixGIW");
        this.africaExplorer = new LocationExplorer("3e6bad8d-a45a-4cd3-ab59-b3a31c505f06", "0ca1c53e-8e76-435b-add8-b7d959fa6f15", "6d820b63-0997-468e-95f9-3563eabd9068", "vB644KfixGIW");
        this.europeExplorer = new LocationExplorer("b117f22c-0663-45f6-997a-10ddba6dedef", "78e87568-b152-4a1d-ab37-c93490ae5e3a", "bd6f1f83-0aa2-4ab9-978d-1d6bc70b564c", "wHE0e33Mx5jX");
        this.australiaExplorer = new LocationExplorer("f5af6703-f635-4884-bb77-2ad4c7fb7ded", "42be1e1b-2c0e-4fde-9170-95e8a771b92c", "4424b627-7156-481a-8151-1543bdf8e8ca", "P5hISByiqXj0");
        this.asiaExplorer = new LocationExplorer("3ff33e66-f3f5-44e5-9b93-96f80f2c1751", "82bcf5ac-c795-419d-a376-6ed9a1660e47", "1748eaa3-b3bd-4abc-87fe-ec5a23b1896c", "aw2EeMeQVOpn");
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
    SearchDestinations(callback) {
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
        self.africaExplorer.SearchDestinations(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchDestinations(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchDestinations(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchDestinations(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchDestinations(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchDestinations(function(ozError, ozData) {
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

    /**
     * Search for points of interest using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of location objects} callback 
     */
    SearchPointsOfInterest(callback) {
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
        self.africaExplorer.SearchPointsOfInterest(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchPointsOfInterest(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchPointsOfInterest(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchPointsOfInterest(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchPointsOfInterest(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchPointsOfInterest(function(ozError, ozData) {
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

    /**
     * Search for activities using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchActivities(callback) {
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
        self.africaExplorer.SearchActivities(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchActivities(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchActivities(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchActivities(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchActivities(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchActivities(function(ozError, ozData) {
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

    /**
     * Search for media using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchMedia(callback) {
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
        self.africaExplorer.SearchMedia(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchMedia(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchMedia(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchMedia(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchMedia(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchMedia(function(ozError, ozData) {
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

    /**
     * Search for volunteer organizations using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchVolunteerOrganizations(callback) {
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
        self.africaExplorer.SearchVolunteerOrganizations(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchVolunteerOrganizations(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchVolunteerOrganizations(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchVolunteerOrganizations(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchVolunteerOrganizations(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchVolunteerOrganizations(function(ozError, ozData) {
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

    /**
     * Search for tourist attractions using added search terms
     * @param {Callback function called at the conclusion of the search; has two parameters: error and data, where error contains any error information and data is an array of string results} callback 
     */
    SearchTouristAttractions(callback) {
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
        self.africaExplorer.SearchTouristAttractions(function(africaError, africaData) {
            if (africaError) {
                console.log(africaError);
            } else {
                result.africa = {
                    match_count: africaData.length,
                    matches: africaData
                }
            }
            self.europeExplorer.SearchTouristAttractions(function(europeError, europeData) {
                if (europeError) {
                    console.log(europeError);
                } else {
                    result.europe = {
                        match_count: europeData.length,
                        matches: europeData
                    }
                }
                self.asiaExplorer.SearchTouristAttractions(function(asiaError, asiaData) {
                    if (asiaError) {
                        console.log(asiaError);
                    } else {
                        result.asia = {
                            match_count: asiaData.length,
                            matches: asiaData
                        }
                    }
                    self.northAmericaExplorer.SearchTouristAttractions(function(naError, naData) {
                        if (naError) {
                            console.log(naError);
                        } else {
                            result.north_america = {
                                match_count: naData.length,
                                matches: naData
                            }
                        }
                        self.southAmericaExplorer.SearchTouristAttractions(function(saError, saData) {
                            if (saError) {
                                console.log(saError);
                            } else {
                                result.south_america = {
                                    match_count: saData.length,
                                    matches: saData
                                }
                            }
                            self.australiaExplorer.SearchTouristAttractions(function(ozError, ozData) {
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