config={
    "data-src":{
        "points":"data/points.geojson",
        "lines":"data/lines.geojson",
        "polygons":"data/multipolygons.geojson"
    },
    "filters":{
        "points": function(data){
            return data;
        },
        "lines": this.points,
        "polygons": this.points
    } 
};