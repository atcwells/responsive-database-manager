(function() {

  var _ = require('lodash-node');
  var fs = require('fs');

    var mongooseFixes = function(schema, options) {
      this.options = options;
      this.schema = schema;
      return this;
    };

    mongooseFixes.prototype.find = function(queryFields, callback) {
        var self = this;
        var populationFields = _getReferenceFields(self.schema.schema.tree);
        if (populationFields) {
            this.schema.find(queryFields).populate(populationFields).exec(function(err, data) {
                if (err) {
                    callback(true, 'ERROR: Unable to read table ' + self.schema.modelName);
                } else {
                    callback(null, _convertToObject(data));
                }
            });
        } else {
            this.schema.find(queryFields, function(err, data) {
                if (err) {
                    callback(true, 'ERROR: Unable to read table ' + self.schema.modelName);
                } else {
                    callback(null, _convertToObject(data));
                }
            });
        }
    };

    mongooseFixes.prototype.findDistinct = function(distinctField, callback) {
        var self = this;
        this.schema.find({}).distinct(distinctField).exec(function(err, data) {
            if (err) {
                callback(true, 'ERROR: Unable to read table ' + self.schema.modelName);
            } else {
                callback(null, data);
            }
        });
    };

    mongooseFixes.prototype.createRecord = function(userId, data, callback) {
        var self = this;
        var newData = _convertObjectsToIds(data);
        newData._updated_by = userId || null;
        newData._created_by = userId || null;
        if(newData.password){
        	delete newData.password;
        }
        var newRecord = new this.schema(newData);
        newRecord.save(function(err, data) {
            if (err) {
                callback(true, 'ERROR: Unable to create record on table ' + self.schema.modelName);
            } else {
            	if(self.options.backupRecords){
            		_writeToFile(self.options.backupDirectory, self.schema.modelName, data);
            	}
              self.find({
                  _id : data._id
              }, function(err, data) {
                  if (err) {
                      callback(true, 'ERROR: Unable to create record on table ' + self.schema.modelName);
                  } else {
                      callback(null, data);
                  }
              });
            }
        });
    };

    mongooseFixes.prototype.updateRecords = function(userId, queryFields, updateFields, callback) {
      var self = this;
      for (var key in updateFields) {
          if (_.isObject(updateFields[key]) && updateFields[key]._id == null) {
              updateFields[key] = '';
          } else if (_.isObject(updateFields[key]) && updateFields[key]._id != undefined) {
              updateFields[key] = updateFields[key]._id;
          }
      }
      this.schema.find(queryFields, function(err, records) {
          if (err) {
            callback(true, 'ERROR: Unable to save record with id:' + queryFields._id);
          } else {
              records.forEach(function(record) {
                  _.each(updateFields, function(field, fieldName) {
                      record[fieldName] = field;
                  });
                  record._updated_by = userId;
                  if (record.password) {
                      delete record.password;
                  }
                  record.save(function(error, result) {
                      if (error) {
                          callback(true, 'ERROR: Unable to save record with id:' + queryFields._id);
                      } else {
                        if(self.options.backupRecords){
                          _writeToFile(self.options.backupDirectory, self.schema.modelName, result);
                        }
                        self.find({
                          _id : result._id
                        }, callback);
                      }
                  });
              });
          }
      });
    };

    mongooseFixes.prototype.deleteRecords = function(queryFields, callback) {
        var self = this;
        if (_.isArray(queryFields)) {
            this.schema.find({
                _id : {
                    $in : queryFields
                }
            }, function(err, records) {
                if (err) {
                    callback(true, 'ERROR: Unable to delete records on table ' + self.schema.modelName);
                } else {
                    var leftToDelete = records.length;
                    _.each(records, function(record) {
                        record.remove(function(err, results) {
                            if (err) {
                                callback(true, 'ERROR: Unable to delete records on table ' + self.schema.modelName);
                            } else {
                                if(self.options.backupRecords){
                                  _deleteFile(self.options.backupDirectory, self.schema.modelName, record._id);
                                }
                                leftToDelete--;
                                if (!leftToDelete) {
                                    callback(null, queryFields);
                                }
                            }
                        });
                    });
                }
            });
        } else {
            this.schema.find(queryFields, function(err, records) {
                if (err) {
                    callback(true, 'ERROR: Unable to delete records on table ' + self.schema.modelName);
                } else {
                    var leftToDelete = records.length;
                    _.each(records, function(record) {
                        record.remove(function(err, results) {
                            if (err) {
                                callback(true, 'ERROR: Unable to delete records on table ' + self.schema.modelName);
                            } else {
                                if(self.options.backupRecords){
                                  _deleteFile(self.options.backupDirectory, self.schema.modelName, record._id);
                                }
                                leftToDelete--;
                                if (!leftToDelete) {
                                    callback(null, queryFields);
                                }
                            }
                        });
                    });
                }
            });
        }
    };

    var _writeToFile = function(backupDirectory, schemaName, document) {
      var path = process.env.PWD + backupDirectory + '/db_' + schemaName + '_' + document._id + '.json';
      var jsonPrettified = JSON.stringify(document, null, 4);
      fs.writeFile(path, document, function(err, msg) {
        if(err) {
          console.log(err, msg);
        } else {
          console.log(null, "Schema written to file successfully");
        }
      })
    };

    var _deleteFile = function(backupDirectory, schemaName, documentID) {
      var path = process.env.PWD + backupDirectory + '/db_' + schemaName + '_' + documentID + '.json';
      fs.unlink(path, function(err, msg) {
        console.log(err, msg);
      })
    };

    var _convertObjectsToIds = function(data) {
        for (var key in data) {
            if (_.isObject(data[key]) && data[key]._id != undefined) {
                data[key] = data[key]._id;
            }
        }
        return data;
    };

    var _getReferenceFields = function(fields) {
        var populationFields = "";
        _.each(fields, function(field, fieldName) {
            if (field.ref) {
                populationFields = (populationFields.length > 0) ? populationFields + " " + fieldName : fieldName;
            }
        });
        return populationFields;
    };

    var _convertToObject = function(results) {
        var responseResults = [];
        for (var key in results) {
            var obj = results[key].toObject();
            for (var field in obj) {
                obj[field] = results[key][field];
            }
            responseResults.push(obj);
        }
        return responseResults;
    };

    module.exports = mongooseFixes;
})();
