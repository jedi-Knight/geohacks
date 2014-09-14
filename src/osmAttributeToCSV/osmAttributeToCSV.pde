Table extractAttributesToTable(XML[] mapFeatures){
  
  Table extractAttributesToTable = new Table();
  
  for(int i = 0; i < mapFeatures.length; i++){
    TableRow newRow = extractAttributesToTable.addRow();
    newRow.setString("osm_id", mapFeatures[i].getString("id"));
    newRow.setString("user", mapFeatures[i].getString("user"));
    newRow.setString("action", mapFeatures[i].getString("action"));
    newRow.setString("timestamp", mapFeatures[i].getString("timestamp"));
  }
  
  return extractAttributesToTable;
}


void setup(){
  XML xml = loadXML("data/osmEdits.osm");
  saveTable(extractAttributesToTable(xml.getChildren("node")), "data/nodeAuthors.csv");
  saveTable(extractAttributesToTable(xml.getChildren("way")), "data/wayAuthors.csv");
  saveTable(extractAttributesToTable(xml.getChildren("relation")), "data/relationAuthors.csv");
}