$(document).ready(function() {
    $("#map").css({
        height: $(document).innerHeight() - 20
    });
    var map = L.map('map', {
        center: [27.71536, 85.34891],
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

    var pointClusters = L.markerClusterGroup({
        showCoverageOnHover: false
    });
    pointClusters.addTo(map);

    pointClusterss = pointClusters;

    function TableContent(jsonData, invert) {
        var content = $("<div></div>").addClass("table-content");
//        if (!jsonData.type) {
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
                    weight: 6,
                    opacity: 0.9,
                    fillColor: "#6666FF",
                    fillOpacity: 0.2,
                    className: "vector-layer"
                });


                layer.on("click", function(e) {
                    popup.setLatLng(e.latlng);
                    popup.openOn(map);
                    popup.setContent(new TableContent(feature.properties, true));
                    popup.update();

                    $(".leaflet-popup").css({
                        "margin-bottom": "0px"
                    });


                });
            }, 0);
        }
    }).addTo(map);

    $.getJSON("data/summary.json", function(data) {
        new Table(data).appendTo("body");
    });

    $.getJSON("data/points.geojson", function(data) {

        setTimeout(function() {

            for (var point in data.features) {
                var marker = L.marker(L.latLng(data.features[point].geometry.coordinates[1], data.features[point].geometry.coordinates[0]), {
                    icon: L.divIcon({
                        iconSize: [25, 42],
                        iconAnchor: [12.5, 40],
                        html: "<img src='markers/yellow.png'/>"
                    }),
                    riseOnHover: true
                });
                marker.bindPopup(new TableContent(data.features[point].properties, true));
                marker.on("click", function(e) {
                    $(".leaflet-popup").css({
                        "margin-bottom": "30px"
                    });
                });
                marker.addTo(pointClusters);
                map.fire("zoomend");
            }
        }, 0);
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

    map.on("zoomend", function() {
        setTimeout(function() {
            $("#map").find("div.marker-cluster").attrByFunction(function() {
                return {
                    "title": "This is a Cluster of " + $(this).find("span").text() + " Point features. Click to zoom in and see the Point features and sub-clusters it contains."
                };
            });

            $("#map").find("div.leaflet-div-icon").attr("title", "This is a Point feature. Click to have a look at some of its attributes");
        }, 0);
    });

    


});
$.fn.attrByFunction = function(fn) {
    return $(this).each(function() {
        $(this).attr(fn.call(this));
    });
};
