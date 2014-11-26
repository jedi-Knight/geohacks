config = {
    "data-src": {
        "points": "data/points.geojson",
        "lines": "data/lines.geojson",
        "polygons": "data/polygons.geojson"
    },
    "filter-parameters": {
        "points": {
            "filterString": ["2014-11-22", "2014-11-28"],
            "type": "range",
            "filter-by": "@timestamp"
        },
        "lines": {
            "filterString": ["2014-11-22", "2014-11-28"],
            "type": "range",
            "filter-by": "@timestamp"
        },
        "polygons": {
            "filterString": ["2014-11-22", "2014-11-28"],
            "type": "range",
            "filter-by": "@timestamp"
        }
    }
};


pluginFunctions = {
    "filter-functions": {
        "filter-by-string": function(data, options) {
            var deferred = $.Deferred();

            setTimeout(function() {
                //var filterString = pluginFunctions["get-filter-string-at-index"](config["filter-parameters"][options["feature-type"]]["range"][0], options["filter-index"]);

                /*var stringBreakAt = filterString.lastIndexOf("-");
                 var filterStringLength = filterString.length;
                 
                 var filterStringPrefix = filterString.substr(0, stringBreakAt);
                 
                 var filterStringSuffix = Number(filterString.substr(stringBreakAt, filterStringLength)) + options["filter-index"];
                 
                 filterString = filterStringPrefix + filterStringSuffix;*/

                var pointsCollection = {
                    "type": "FeatureCollection",
                    "features": []
                };


                for (var point in data.features) {
                    if ((data.features[point]["properties"][config["filter-parameters"][options["feature-type"]]["filter-by"]] + "").indexOf(options.filterString) + 1)
                        pointsCollection.features.push(data.features[point]);
                }

                deferred.resolve(pointsCollection);

            }, 0);

            return deferred.promise();

        }
    },
    "get-filter-string-at-index": function(filterString, index) {
        var deferred = $.Deferred();
        setTimeout(function() {
            var stringBreakAt = filterString.lastIndexOf("-");
            var filterStringLength = filterString.length;

            var filterStringPrefix = filterString.substr(0, stringBreakAt);

            var filterStringSuffix = Number(filterString.substr(stringBreakAt, filterStringLength)) + index;

            filterString = filterStringPrefix + filterStringSuffix;

            deferred.resolve(filterString);
        }, 0);

        return deferred.promise();
    }
};



plugins = {
    "filters": {
        "range": {
            "points": pluginFunctions["filter-functions"]["filter-by-string"],
            "lines": pluginFunctions["filter-functions"]["filter-by-string"],
            "polygons": pluginFunctions["filter-functions"]["filter-by-string"]
        }
    }
};

