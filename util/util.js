var fs = require('fs');

module.exports.readJsonFile = function(fileLocation, callback) {
  fs.readFile(process.env.PWD + fileLocation, 'UTF8', function(err, fileContents) {
    if(err){
      callback(true, err);
    }else{
      callback(null, JSON.parse(fileContents));
    }
  });
};


module.exports.writeJsonSchema = function(path, schemaName, schemaDefinition, callback) {
  var jsonSchema = {
    name: schemaName,
    fields: schemaDefinition
  };
  var jsonPrettified = JSON.stringify(jsonSchema, null, 4);
  fs.writeFile(path, jsonPrettified, function(err, msg) {
    if(err) {
      callback(err, msg)
    } else {
      callback(null, "Schema written to file successfully");
    }
  })
}
