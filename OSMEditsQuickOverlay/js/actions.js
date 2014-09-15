$(document).ready(function() {
    $("#map").css({
        height: $(document).innerHeight() - 20
    });
    var map = L.map('map', {
        center: [27.71256, 85.34751],
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
    
    var pointClusters = L.markerClusterGroup();
    map.addLayer(pointClusters);

    var markerPoint = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            if (feature.properties.nodeAuthors_action === "delete")
                map.removeLayer(layer);
            
            pointClusters.addLayer(layer);
            
            
            
            var popup = L.popup({
                autoPan: true,
                keepInView: true
            });
            //popup.setContent(popupContent);
            layer.on("click", function(e) {
                var deferred = $.Deferred();
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new TableContent(feature.properties, true));
                popup.update();

                deferred.resolve();
                deferred.done(function() {

                });
            });
        },
        pointToLayer: function(feature, latlng) {
            //if(feature.properties.nodeAuthors_action==="delete") return;
            //map.panTo(latlng);
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "markers/point.png",
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                }),
                riseOnHover: true,
                opacity: 0
            });
        }
    }).addTo(map);

    var osmWays = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            if (feature.properties.wayAuthors_action === "delete")
                map.removeLayer(layer);
            var popup = L.popup({
                autoPan: true,
                keepInView: true
            });
            
            layer.setStyle({
                color: "#333366",
                weight: 4,
                opacity: 1,
                fillColor: "#6666FF",
                fillOpacity: 0.2,
                className: "vector-layer"
            });
            
            //popup.setContent(popupContent);
            layer.on("click", function(e) {
                var deferred = $.Deferred()
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new TableContent(feature.properties, true));
                popup.update();

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
        markerPoint.addData(data);
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