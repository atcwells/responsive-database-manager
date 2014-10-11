var fs = require('fs');
var shell = require('shelljs');

module.exports.readJsonFile = function(fileLocation, callback) {
  fs.readFile(shell.pwd() + fileLocation, 'UTF8', function(err, fileContents) {
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
};

module.exports.removeJsonSchema = function(path, schemaName, callback) {
  fs.unlink(path + schemaName + '.json', callback)
};
