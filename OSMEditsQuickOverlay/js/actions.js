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
        maxZoom: 18,
        minZoom: 1
    });
    osmTileLayer.addTo(map);

    function PopupContent(jsonData) {
        var content = $("<div></div>").addClass("popupContent");
        for (var row in jsonData) {
            $("<div></div>")
                    .addClass("table-row")
                    .text(function() {
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
                        return jsonData[row] ? key + ": " + jsonData[row] : "";
                    }).prependTo(content).addClass(row);
        }
        return $(content)[0];
    }

    var markerPoint = L.geoJson(null, {
        onEachFeature: function(feature, layer) {
            if (feature.properties.nodeAuthors_action === "delete")
                map.removeLayer(layer);
            var popup = L.popup({
                autoPan: true,
                keepInView: true
            });
            //popup.setContent(popupContent);
            layer.on("click", function(e) {
                var deferred = $.Deferred();
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new PopupContent(feature.properties));
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
                    iconSize: [10, 10],
                    iconAnchor: [5, 5]
                })
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
            //popup.setContent(popupContent);
            layer.on("click", function(e) {
                var deferred = $.Deferred()
                popup.setLatLng(e.latlng);
                popup.openOn(map);
                popup.setContent(new PopupContent(feature.properties));
                popup.update();

                deferred.resolve();
                deferred.done(function() {

                });
            });
        }
    }).addTo(map);

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