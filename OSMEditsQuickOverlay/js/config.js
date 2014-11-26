config = {
    "data-src": {
        "points": "data/points.geojson",
        "lines": "data/lines.geojson",
        "polygons": "data/polygons.geojson"
    },
    "filter-parameters": {
        "points": {
            "range": ["2014-11-22", "2014-11-28"],
            "filter-by": "@timestamp"
        },
        "lines": {
            "range": ["2014-11-22", "2014-11-28"],
            "filter-by": "@timestamp"
        },
        "polygons": {
            "range": ["2014-11-22", "2014-11-28"],
            "filter-by": "@timestamp"
        }
    }
};


pluginFunctions = {
    "filter-functions": {
        "filter-by-range-index": function(data, options) {
                var deferred = $.Deferred();

                setTimeout(function() {
                    var filterString = config["filter-parameters"][options["feature-type"]]["range"][0];

                    var stringBreakAt = filterString.lastIndexOf("-");
                    var filterStringLength = filterString.length;

                    var filterStringPrefix = filterString.substr(0, stringBreakAt);

                    var filterStringSuffix = Number(filterString.substr(stringBreakAt, filterStringLength)) + options["filter-index"];

                    filterString = filterStringPrefix + filterStringSuffix;

                    var pointsCollection = {
                        "type": "FeatureCollection",
                        "features": []
                    };


                    for (var point in data.features) {
                        if ((data.features[point]["properties"][config["filter-parameters"][options["feature-type"]]["filter-by"]] + "").indexOf(filterString) + 1)
                            pointsCollection.features.push(data.features[point]);
                    }

                    deferred.resolve(pointsCollection);

                }, 0);

                return deferred.promise();

            }
    }
}



plugins = {
    "filters": {
        "range": {
            "points": pluginFunctions["filter-functions"]["filter-by-range-index"],
            "lines": pluginFunctions["filter-functions"]["filter-by-range-index"],
            "polygons": pluginFunctions["filter-functions"]["filter-by-range-index"]
        }
    }
};

