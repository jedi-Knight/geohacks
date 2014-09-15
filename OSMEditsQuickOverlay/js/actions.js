$(document).ready(function() {
    $("#map").css({
        height: $(document).innerHeight() - 20
    });
    var map = L.map('map', {
        center: [27.71236, 85.34731],
        zoom: 15,
        doubleClickZoom: true
    });
    var osmTileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 19,
        minZoom: 1
    });
    osmTileLayer.addTo(map);
    L.control.scale().addTo(map);

    function TableContent(jsonData, invert) {
        var content = $("<div></div>").addClass("table-content");
        for (var row in jsonData) {
            var tableRow = $("<div></div>")
                    .addClass("table-row")
                    .append(function() {
                        var key = row;
                        switch (key) {
                            case "wayAuthors":
                                key = "Username";
                                break
                            case "nodeAuthors":
                                key = "Username";
                                break;
                            case "wayAuthor":
                                key = "Username";
                                break
                            case "nodeAuthor":
                                key = "Username";
                                break;
                            case "wayAuthors_action":
                                key = "Action";
                                break
                            case "nodeAuthors_action":
                                key = "Action";
                                break;

                        }
                        return jsonData[row] ? $("<div></div>").text(key).append($("<div></div>").text(jsonData[row])) : "";
                    });
            invert ? tableRow.prependTo(content).addClass(row) : tableRow.appendTo(content).addClass(row);
        }
        return $(content)[0];
    }

    function Table(jsonData) {
        return $("<div></div>").append($("<div class='title'></div>").text(jsonData.type))
                .addClass("table container").addClass(jsonData.type)
                .append(new TableContent(jsonData.data));
    }

    var popup = L.popup({
        autoPan: true,
        keepInView: true
    });

    var osmWays = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            if (feature.properties.wayAuthors_action === "delete")
                map.removeLayer(layer);

            layer.setStyle({
                color: "#333366",
                weight: 6,
                opacity: 0.9,
                fillColor: "#6666FF",
                fillOpacity: 0.2,
                className: "vector-layer"
            });

            layer.on("click", function(e) {
                var deferred = $.Deferred()
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new TableContent(feature.properties, true));
                popup.update();
                
                $(".leaflet-popup").css({
                    "margin-bottom": "0px"
                });
                
                deferred.resolve();
                deferred.done(function() {

                });
            });
        }
    }).addTo(map);

    $.getJSON("data/summary.json", function(data) {
        new Table(data).appendTo("body");
    });

    $.getJSON("data/points.geojson", function(data) {
        var pointClusters = L.markerClusterGroup();
        for (var point in data.features) {
            var marker = L.marker(L.latLng(data.features[point].geometry.coordinates[1], data.features[point].geometry.coordinates[0]), {
                icon: L.divIcon({
                    iconSize: [25, 42],
                    iconAnchor: [12.5, 40],
                    html: "<img src='markers/yellow.png'/>"
                }),
                riseOnHover: true
            });
            marker.on("click", function(e) {
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new TableContent(data.features[point].properties, true));
                popup.update();
                $(".leaflet-popup").css({
                    "margin-bottom": "30px"
                });
            });
            marker.addTo(pointClusters);
        }
        pointClusters.addTo(map);
    });
    $.getJSON("data/lines.geojson", function(data) {
        osmWays.addData(data);
    });
    $.getJSON("data/multilinestrings.geojson", function(data) {
        osmWays.addData(data);
    });
    $.getJSON("data/multipolygons.geojson", function(data) {
        osmWays.addData(data);
    });

});