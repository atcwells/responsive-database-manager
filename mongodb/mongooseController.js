var fs = require('fs');
var util = require('../util/util.js');
var _ = require('lodash-node');
var shell = require('shelljs');

module.exports = init = function(options, callback) {
  return new mongooseController(options, callback);
}

mongooseController = function(options, callback) {
  var self = this;
  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.schemas = {};
  this.schemaDefinitions = {};
  this.contracts = {
      mandatory_properties : require('./contracts/mongooseMandatoryProperties.js')(this.options),
      mandatory_fields : require('./contracts/mongooseMandatoryFields.js')(this.options),
      field_types : require('./contracts/mongooseFieldTypes.js')(this.options),
      defaults : require('./contracts/mongooseDefaults.js')(this.options),
      validators : require('./contracts/mongooseValidators.js')(this.options),
      getters : require('./contracts/mongooseGetters.js')(this.options),
      setters : require('./contracts/mongooseSetters.js')(this.options)
  };

  self.setup(function(err, msg) {
    if(err) {
      callback(err, msg);
    } else {
      self.readSchemaDirectory(callback);
    }
  });
};

mongooseController.prototype.setup = function(callback) {
  if(!this.options.mongoUrl)
    throw('Cannot connect to MongoDB, no URL specified.');

  this.logger.info('Configuring MongoDB & Mongoose at ' + this.options.mongoUrl + ' ...');
  this.mongoose = require('mongoose');
  this.mongoose.connect(this.options.mongoUrl);
  this.logger.info('MongoDB & Mongoose configuration complete.');
  callback(null, 'MongoDB & Mongoose configuration complete.')
}

mongooseController.prototype.readSchemaDirectory = function(callback) {
  var self = this;
  var basePath = shell.pwd() + this.options.schemaDirectory + '/';
  fs.readdir(basePath, function(err, files) {
    if(err) {
      callback(true, "Unable to read schema directory: " + basePath)
    } else {
      var schemasToRead = files.length;
      files.forEach(function(file) {
        self.logger.info('Attempting to read schema definition at: ' + basePath + file);
        fs.readFile(basePath + file, 'UTF8', function(err, fileContents){
          schemaJson = JSON.parse(fileContents);
          self.logger.info('Configuring schema: ' + schemaJson.name);
          self.setupSchema(schemaJson.name, schemaJson.fields, function() {
            schemasToRead--
            if(!schemasToRead){
              callback(null, "All schemas read successfully");
            }
          });
        });
      })
    }
  });
};

mongooseController.prototype.invalidateRelevantSchemas = function(contractName, field, callback) {
  var self = this;
  switch(contractName){
    case 'defaults':
    case 'validators':
    case 'getters':
    case 'setters':
      var schemasToEvaluate = self.schemaDefinitions.size();
      for(var key in self.schemaDefinitions) {
        if(this._isSchemaInterested(contractName, self.schemaDefinitions[key])) {
          this._flushSingleSchema(key, self.schemaDefinitions[key], function() {
            schemasToEvaluate--
            if(!schemasToEvaluate) {
              callback(null, "Relevant schemas flushed");
            }
          })
        }
      }
      callback(null, "");
      break;
    case 'mandatory_properties':
    case 'mandatory_fields':
      case 'field_types':
      self._flushAllSchemas(callback);
      break;
    default:
      callback(true, "invalid schema invalidation request: "  + contractName);
      break;

  }
};

mongooseController.prototype.addSchema = function(schemaName, schemaFields, callback) {
  if(this.schemaDefinitions[schemaName]) {
    callback(true, "schema with name [" + schemaName + "] already exists, cannot continue");
  } else {
    this.setupSchema(schemaName, schemaFields, callback);
  }
};

mongooseController.prototype.removeSchema = function(schemaName, callback) {
  var self = this;
  if(self.mongoose.connection && self.mongoose.connection.base.models[schemaName]) {
    delete self.mongoose.connection.base.models[schemaName];
    delete self.mongoose.connection.base.modelSchemas[schemaName];
    util.removeJsonSchema(shell.pwd() + self.options.schemaDirectory + '/', schemaName, function(err, msg) {
      if(err) {
        callback(err, msg);
      } else {
        callback(null, "Schema [" + schemaName + '] removed successfully');
      }
    })

  } else {
    callback(true, 'Schema [' + schemaName + '] does not exist so cannot remove');
  }
};

mongooseController.prototype.changeSchema = function(schemaName, schemaFields, callback) {
  this.removeSchema(schemaName, function(err, msg) {
    if(err) {
      callback(true, 'Couldn\'t alter schema [' + schemaName + '] because it it couldn\'nt be removed');
    } else {
      this.setupSchema(schemaName, schemaFields, callback);
    }
  });
}

mongooseController.prototype.setupSchema = function(schemaName, schemaFields, callback) {
  var self = this;
  this.schemaDefinitions[schemaName] = schemaFields;

  if (!this.contracts.mandatory_properties.checkContractSync(schemaFields)) {
    this.logger.warn('Schema called ' + schemaName + ' is missing required properties, adding missing properties.');
    var fixedSchemaFields = this.contracts.mandatory_properties.applyMandatoryPropertiesSync(schemaFields);
    this.setupSchema(schemaName, fixedSchemaFields, callback);

  } else if (!this.contracts.mandatory_fields.checkContractSync(schemaFields)) {
    this.logger.warn('Schema called ' + schemaName + ' is missing required fields, added missing fields.');
    var fixedSchemaFields = this.contracts.mandatory_fields.applyMandatoryFieldsSync(schemaFields);
    this.setupSchema(schemaName, fixedSchemaFields, callback);

  } else if (!this.contracts.field_types.checkContractSync(schemaFields)) {
    this.logger.warn('Schema called ' + schemaName + ' has incorrect field types, setting those types to string');
    var fixedSchemaFields = this.contracts.field_types.makeInvalidFieldsStringSync(schemaFields);
    this.setupSchema(schemaName, fixedSchemaFields, callback);

  } else {
    this.logger.info('Schema called ' + schemaName + ' is valid, configuring for use.');
    for (var key in schemaFields) {
      schemaFields[key] = this.contracts.defaults.applyDefaultsSync(key, schemaFields[key]);
      schemaFields[key] = this.contracts.getters.applyGettersSync(key, schemaFields[key]);
      schemaFields[key] = this.contracts.setters.applySettersSync(key, schemaFields[key]);
      schemaFields[key] = this.contracts.validators.applyValidatorsSync(key, schemaFields[key]);
    }
    self.schemaDefinitions[schemaName] = schemaFields;
    var schemaPath = shell.pwd() + this.options.schemaDirectory + '/' + schemaName + '.json';
    util.writeJsonSchema(schemaPath, schemaName, self.schemaDefinitions[schemaName], function(err, msg) {
      if(err) {
        callback(null, msg);
      } else {
        schemaFields = self._sanitizeFieldTypesForMongooseSync(schemaFields);
        self._createSchema(schemaName, schemaFields, function(err, schema) {
          if(err) {
            callback(null, 'Schema called ' + schemaName + ' could not be configured.');
          } else {
            self.schemas[schemaName] = schema
            callback(null, 'Schema called ' + schemaName + ' is configured successfully.');
          }
        });
      }
    });
  }
};

mongooseController.prototype._flushAllSchemas = function(callback) {
  this.mongoose.connection.models = {};
  var schemasToEvaluate = this.schemaDefinitions.size();
  for(var key in this.schemaDefinitions) {
    this.setupSchema(key, this.schemaDefinitions[key], function() {
      schemasToEvaluate--;
      if(!schemasToEvaluate) {
        callback(null, "All schemas refreshed");
      }
    });
  }
};

mongooseController.prototype._isSchemaInterestedSync = function(contractName, schema) {
  return true;
};

mongooseController.prototype._flushSingleSchema = function(schemaName, schemaFields, callback) {
  this.removeSchema(schemaName, function(err, msg) {
    if(err) {
      callback(true, msg);
    } else {
      this.setupSchema(schemaName, schemaFields, callback);
    }
  });
};

mongooseController.prototype._sanitizeFieldTypesForMongooseSync = function(schemaFields) {
  var fields = {};
  for(var key in schemaFields) {
      var field = schemaFields[key];
      field.type = this.contracts.field_types.getRealFieldTypeSync(schemaFields[key].subtype);
      if(field.type === 'objectid'){
        field.type = this.mongoose.Schema.Types.ObjectId;
      }
      fields[key] = field;
  };
  return fields;
};

mongooseController.prototype._createSchema = function(schemaName, schemaFields, callback) {
  this.logger.info('Creating schema called ' + schemaName);
  var schema = this.mongoose.model(schemaName, schemaFields);
  schema.schema.pre('save', function(next) {
      this['_updated_on'] = new Date;
      next();
  });
  this.logger.info('Created schema called ' + schemaName);
  callback(null, schema);
};
