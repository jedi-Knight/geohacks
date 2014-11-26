function Model() {
    var features = {
        points: {},
        lines: {},
        polygons: {}
    };

    function store(data, options) {
        features[options["feature-type"]] = data;
        options["deferred"].resolve();
    }

    function _retrieve(options) {
        var deferred = $.Deferred();
        setTimeout(function() {
            if (!options["filter"])
                deferred.resolve(features[options["feature-type"]]);
            else {
                var filterDeferred = options["filter"](features[options["feature-type"]], options);
                filterDeferred.done(function(filteredData) {
                    deferred.resolve(filteredData);
                });
            }
        }, 0);
        return deferred.promise();
    }

    this.retrieve = function(options) {
        return _retrieve(options);
    };

    function _fetchData(options) {
        var queryDeferred = $.Deferred();
        $.ajax({
            url: options.src,
            success: function(data) {
                options.deferred = queryDeferred;
                store(data, options);
            },
            dataType: "json"
        });
        return queryDeferred.promise();
    }

    this.fetchData = function(options) {
        return _fetchData(options);
    };
}


function TableContent(jsonData, invert) {
    var content = $("<div></div>").addClass("table-content");
//        if (!jsonData.type) {
    for (var row in jsonData) {
        var tableRow = $("<div></div>")
                .addClass("table-row")
                .append(function() {
                    return jsonData[row] ? $("<div></div>").text(row).append($("<div></div>").text(jsonData[row])) : "";
                });
        invert ? tableRow.prependTo(content).addClass(row) : tableRow.appendTo(content).addClass(row);
    }
    /*}else if(jsonData.type==="image"){
     for (var row in jsonData.data){
     var tableRow = $("<div></div>")
     .addClass("table-row")
     .append(function(){
     return $("<div></div>").append("<img src='"+row+"'/>")
     .add($("<div></div>").text(jsonData.data[row]));
     });
     invert ? tableRow.prependTo(content).addClass(row) : tableRow.appendTo(content).addClass(row);
     }
     }*/
    return $(content)[0];
}

function Table(jsonData) {
    return $("<div></div>").append($("<div class='title'></div>").text(jsonData.type))
            .addClass("table container").addClass(jsonData.type)
            .append(new TableContent(jsonData.data));
}

function clusterSpell(options) {

    setTimeout(function() {

        for (var point in options.data.features) {
            var marker = L.marker(L.latLng(options.data.features[point].geometry.coordinates[1], options.data.features[point].geometry.coordinates[0]), {
                icon: L.divIcon({
                    iconSize: [25, 42],
                    iconAnchor: [12.5, 40],
                    html: "<img src='markers/yellow.png'/>"
                }),
                riseOnHover: true,
                title: "This is a Point feature. Click to have a look at some of its attributes"
            });
            marker.bindPopup(new TableContent(options.data.features[point].properties, true), {
                autoPan: true,
                keepInView: true,
                offset: L.point(0, -22)
            });
            marker.addTo(options.pointClusters);
            options.map.fire("zoomend");
        }
    }, 0);

}

function addFeaturesToLayer(options) {
    setTimeout(function() {
        options.layer.addData(options.data);
    }, 0);
}

function retrievePointsAndClusterThem(options) {
    var retrievePromise = options.model.retrieve(options);
    retrievePromise.done(function(data) {
        options.data = data;
        clusterSpell(options);
    });
}

function retrieveLinesAndPolygonsAndAddThemToLayer(options) {
    var retrievePromise = options.model.retrieve(options);
    retrievePromise.done(function(data) {
        options.data = data;
        addFeaturesToLayer(options);
    });
}




$(document).ready(function() {
    var timesliceIndex = 0;

    $("#map").css({
        height: $(document).innerHeight() - 20
    });
    var map = L.map('map', {
        center: [27.6440, 85.1208],
        zoom: 15,
        doubleClickZoom: true,
        maxZoom: 19,
        minZoom: 1
    });
    var osmTileLayer = L.tileLayer(!navigator.userAgent.contains ? 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: 'Map data and tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright/">Read the Licence here</a> | Cartography &copy; <a href="http://kathmandulivinglabs.org">Kathmandu Living Labs</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    });
   // osmTileLayer.addTo(map);
    L.control.scale().addTo(map);

    var pointClusters = L.markerClusterGroup({
        showCoverageOnHover: false
    });
    pointClusters.addTo(map);



    var popup = L.popup({
        autoPan: true,
        keepInView: true
    });



    var osmWays = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            setTimeout(function() {
                layer._container.setAttribute("title", "This is a " + feature.geometry.type.replace("String", "") + " feature. Click to have a look at some of its attributes.");

                layer.setStyle({
                    color: "#333366",
                    weight: feature.geometry.type === "Polygon" ? 3 : 6,
                    opacity: 0.9,
                    fillColor: "#ffff99",
                    fillOpacity: 1

                });
                layer.on("click", function(e) {
                    popup.setLatLng(e.latlng);
                    popup.openOn(map);
                    popup.setContent(new TableContent(feature.properties, true));
                    popup.update();
                });
            }, 0);
        },
        className: "vector-layer"
    }).addTo(map);


    var model = new Model();

    var fetchPointsPromise = model.fetchData({
        "src": config["data-src"]["points"],
        "feature-type": "points"
    });

    fetchPointsPromise.done(function() {
        var prepareFilterString;

        if (config["filter-parameters"]["points"]["type"] === "string") {
            prepareFilterString = $.Deferred();
            prepareFilterString.resolve(config["filter-parameters"]["points"]["filterString"]);
        } else if (config["filter-parameters"]["points"]["type"] === "range") {
            prepareFilterString = pluginFunctions["get-filter-string-at-index"](config["filter-parameters"]["points"]["filterString"][0], timesliceIndex);
        }

        prepareFilterString.done(function(filterString) {

            retrievePointsAndClusterThem({
                "feature-type": "points",
                "model": model,
                "filter": plugins.filters[config["filter-parameters"]["points"]["type"]]["points"],
                //"filter-index": timesliceIndex,
                "map": map,
                "pointClusters": pointClusters,
                "filterString": filterString
            });
        });
    });

    var fetchLinesPromise = model.fetchData({
        "src": config["data-src"]["lines"],
        "feature-type": "lines"
    });

    fetchLinesPromise.done(function() {
        var prepareFilterString;

        if (config["filter-parameters"]["lines"]["type"] === "string") {
            prepareFilterString = $.Deferred();
            prepareFilterString.resolve(config["filter-parameters"]["lines"]["filterString"]);
        } else if (config["filter-parameters"]["lines"]["type"] === "range") {
            prepareFilterString = pluginFunctions["get-filter-string-at-index"](config["filter-parameters"]["lines"]["filterString"][0], timesliceIndex);
        }

        prepareFilterString.done(function(filterString) {

            retrieveLinesAndPolygonsAndAddThemToLayer({
                "feature-type": "lines",
                "model": model,
                "filter": plugins.filters[config["filter-parameters"]["lines"]["type"]]["lines"],
                //"filter-index": timesliceIndex,
                "map": map,
                "layer": osmWays,
                "filterString": filterString
            });
        });
    });

    var fetchPolygonsPromise = model.fetchData({
        "src": config["data-src"]["polygons"],
        "feature-type": "polygons"
    });

    fetchPolygonsPromise.done(function() {
        var prepareFilterString;

        if (config["filter-parameters"]["polygons"]["type"] === "string") {
            prepareFilterString = $.Deferred();
            prepareFilterString.resolve(config["filter-parameters"]["polygons"]["filterString"]);
        } else if (config["filter-parameters"]["polygons"]["type"] === "range") {
            prepareFilterString = pluginFunctions["get-filter-string-at-index"](config["filter-parameters"]["polygons"]["filterString"][0], timesliceIndex);
        }

        prepareFilterString.done(function(filterString) {

            retrieveLinesAndPolygonsAndAddThemToLayer({
                "feature-type": "polygons",
                "model": model,
                "filter": plugins.filters[config["filter-parameters"]["polygons"]["type"]]["polygons"],
                //"filter-index": timesliceIndex,
                "map": map,
                "layer": osmWays,
                "filterString": filterString
            });
        });
    });


    $.getJSON("data/summary.json", function(data) {
        new Table(data).appendTo("body");
    });

    map.on("zoomend", function() {
        setTimeout(function() {
            $("#map").find("div.marker-cluster").attrByFunction(function() {
                return {
                    "title": "This is a Cluster of " + $(this).find("span").text() + " Point features. Click to zoom in and see the Point features and sub-clusters it contains."
                };
            });

            //$("#map").find("div.leaflet-div-icon").attr("title", "This is a Point feature. Click to have a look at some of its attributes");
        }, 0);
    });




});
$.fn.attrByFunction = function(fn) {
    return $(this).each(function() {
        $(this).attr(fn.call(this));
    });
};
