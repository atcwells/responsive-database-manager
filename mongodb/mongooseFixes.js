(function() {

    var mongooseFixes = function(schema, userId) {
        this.schema = schema;
        this.userId = userId;
        this.schemaDefinition = $cache.get('schema.' + this.schema.schemaDefinition.name);
        return this;
    };

    mongooseFixes.prototype.find = function(queryFields, callback) {
        var self = this;
        var populationFields = _getReferenceFields(self.schemaDefinition.fields);
        if (populationFields) {
            this.schema.model.find(queryFields).populate(populationFields).exec(function(err, data) {
                if (err) {
                    callback(true, 'ERROR: Unable to read table ' + self.schemaDefinition.name);
                } else {
                    callback(null, _convertToObject(data));
                }
            });
        } else {
            this.schema.model.find(queryFields, function(err, data) {
                if (err) {
                    callback(true, 'ERROR: Unable to read table ' + self.schemaDefinition.name);
                } else {
                    callback(null, _convertToObject(data));
                }
            });
        }
    };

    mongooseFixes.prototype.findDistinct = function(distinctField, callback) {
        var self = this;
        this.schema.model.find({}).distinct(distinctField).exec(function(err, data) {
            if (err) {
                callback(true, 'ERROR: Unable to read table ' + self.schemaDefinition.name);
            } else {
                callback(null, data);
            }
        });
    };

    mongooseFixes.prototype.createRecord = function(data, callback) {
        var self = this;
        var newData = _convertObjectsToIds(data);
        newData._updated_by = this.userId;
        newData._created_by = this.userId;
        if(newData.password){
        	delete newData.password;
        }
        var newRecord = this.schema.model(newData);
        newRecord.save(function(err, data) {
            if (err) {
                callback(true, 'ERROR: Unable to create record on table ' + self.schemaDefinition.name);
            } else {
            	if(!$server.controller.production){
            		var dbFile = new $dir.json_file($cache.get('database_config.data_directory') + '/db_record_' + data._id + '.json');
            		dbFile.contents = data;
            		dbFile.writeFile();
            	}
                self.find({
                    _id : data._id
                }, function(err, data) {
                    if (err) {
                        callback(true, 'ERROR: Unable to create record on table ' + self.schemaDefinition.name);
                    } else {
                        callback(null, data);
                    }
                });
            }
        });
    };

    mongooseFixes.prototype.updateRecords = function(record, callback) {

    };

    mongooseFixes.prototype.deleteRecords = function(queryFields, callback) {
        var self = this;
        if (_.isArray(queryFields)) {
            this.schema.model.find({
                _id : {
                    $in : queryFields
                }
            }, function(err, records) {
                if (err) {
                    callback(true, 'ERROR: Unable to delete records on table ' + self.schemaDefinition.name);
                } else {
                    var leftToDelete = records.length;
                    _.each(records, function(record) {
                        record.remove(function(err, results) {
                            if (err) {
                                callback(true, 'ERROR: Unable to delete records on table ' + self.schemaDefinition.name);
                            } else {
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
            this.schema.model.find(queryFields, function(err, record) {
                if (err) {
                    callback(true, 'ERROR: Unable to delete records on table ' + self.schemaDefinition.name);
                } else {
                    record.remove(function(err, results) {
                        if (err) {
                            callback(true, 'ERROR: Unable to delete records on table ' + self.schemaDefinition.name);
                        } else {
                            callback(null, queryFields);
                        };
                    });
                }
            });
        }
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
