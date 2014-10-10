var _ = require('lodash-node');

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

module.exports = init = function(options, callback) {
	return new database_manager(options, callback);
}

function database_manager(optionsObj, callback) {
	this.options = optionsObj || {};
	this.logger = {
		debug : (this.options.logger && this.options.logger.debug) || console.log,
		info : (this.options.logger && this.options.logger.info) || console.log,
		warn : (this.options.logger && this.options.logger.war) || console.log,
		error : (this.options.logger && this.options.logger.error) || console.log
	};

	var self = this;

  self.controller = require('./mongodb/mongooseController.js')(self.options, function(err, msg) {
    if(self.options.wipeSchemas) {
      self._wipeSchemas(callback);
    } else {
      callback(err, msg);
    }
  });
};

/*
	Schema functions
*/
database_manager.prototype.getSchemaNames = function(callback) {
  var names = [];
  for(var key in this.controller.schemas){
    names.push(key);
  }
  callback(null, names)
};

database_manager.prototype.addSchema = function(schemaName, schemaFields, callback) {
	this.controller.addSchema(schemaName, schemaFields, callback);
};

database_manager.prototype.removeSchema = function(schemaName, callback) {
	this.controller.removeSchema(schemaName, callback);
};

database_manager.prototype.changeSchema = function(schemaName, schemaFields, callback) {
	this.controller.changeSchema(schemaName, schemaFields, callback);
};

database_manager.prototype.getSchemaDefinition = function(schemaName, callback) {
  callback(null, this.controller.schemaDefinitions[schemaName]);
};

database_manager.prototype.schema = function(schemaName) {
	var self = this;
	if(!self.controller.schemas[schemaName]){
		return {};
	} else {
		self.controller.schemas[schemaName].getFields = function(callback) {
			callback(null, this.controller.schemas[schemaName].schema.tree);
		};
	}
	if(this.options.useMongooseFixes) {
		var instance = require('./mongodb/mongooseFixes.js');
		return new instance(this.controller.schemas[schemaName], this.options);
	} else {
		return this.controller.schemas[schemaName];
	}
};

database_manager.prototype._wipeSchemas = function(callback) {
console.log('test');

  callback(null, "");
}

/*
	Field Type functions
*/
database_manager.prototype.getFieldTypes = function(callback) {
	callback(null, this.controller.contracts.field_types.fieldTypes);
};

database_manager.prototype.getFieldType = function(fieldType, callback) {
	callback(null, this.controller.contracts.field_types.fieldTypes[fieldType]);
};

database_manager.prototype.changeFieldType = function(fieldName, fieldType, callback) {
	var self = this;
	this.controller.contracts.field_types.changeFieldType(fieldName, fieldType, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('field_types', fieldName, callback);
		}
	});
};

database_manager.prototype.removeFieldType = function(fieldName, callback) {
	var self = this;
	this.controller.contracts.field_types.removeFieldType(fieldName, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('field_types', fieldName, callback);
		}
	});
};

database_manager.prototype.addFieldTypes = function(fieldName, fieldType, callback) {
	this.controller.contracts.field_types.addFieldType(fieldName, defaultValue, callback);
};

/*
	Mandatory Field Type functions
*/
database_manager.prototype.getMandatoryFields = function(callback) {
	callback(null, this.controller.contracts.mandatory_fields.mandatoryFields);
};

database_manager.prototype.getMandatoryField = function(mandatoryField, callback) {
	callback(null, this.controller.contracts.mandatory_fields.mandatoryFields[mandatoryField]);
};

database_manager.prototype.changeMandatoryField = function(mandatoryField, mandatoryFieldProperties, callback) {
	var self = this;
	this.controller.contracts.mandatory_fields.changeMandatoryField(mandatoryField, mandatoryFieldProperties, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('mandatory_fields', mandatoryField, callback);
		}
	});
};

database_manager.prototype.removeMandatoryField = function(fieldName, callback) {
	this.controller.contracts.mandatory_fields.removeMandatoryField(fieldName, callback);
};

database_manager.prototype.addMandatoryField = function(fieldName, mandatoryField, callback) {
	var self = this;
	this.controller.contracts.mandatory_fields.addMandatoryField(fieldName, mandatoryField, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('mandatory_fields', fieldName, callback);
		}
	});
};

/*
	Mandatory Property functions
*/
database_manager.prototype.getMandatoryProperties = function(callback) {
	callback(null, this.controller.contracts.mandatory_properties.mandatoryProperties);
};

database_manager.prototype.getMandatoryProperty = function(mandatoryProperty, callback) {
	callback(null, this.controller.contracts.mandatory_properties.mandatoryProperties[mandatoryProperty]);
};

database_manager.prototype.changeMandatoryProperty = function(propertyName, defaultValue, callback) {
	var self = this;
	this.controller.contracts.mandatory_properties.changeMandatoryProperty(propertyName, defaultValue, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('mandatory_properties', propertyName, callback);
		}
	});
};

database_manager.prototype.removeMandatoryProperty = function(propertyName, mandatoryField) {
	this.controller.contracts.mandatory_properties.removeMandatoryProperty(propertyName, callback);
};

database_manager.prototype.addMandatoryProperty = function(fieldName, defaultValue, callback) {
	var self = this;
	this.controller.contracts.mandatory_properties.addMandatoryProperty(propertyName, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('mandatory_properties', propertyName, callback);
		}
	});
};

/*
	Getters functions
*/
database_manager.prototype.getGetters = function (callback) {
	callback(null, this.controller.contracts.getters);
};

database_manager.prototype.getGetter = function (fieldName, callback) {
	callback(null, this.controller.contracts.getters[fieldName]);
};

database_manager.prototype.setGetter = function (fieldName, fn, callback) {
	var self = this;
	this.controller.contracts.getters.setGetter(fieldName, fn, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('getters', fieldName, callback);
		}
	});
};

/*
	Setter functions
*/
database_manager.prototype.getSetters = function (callback) {
	callback(null, this.controller.contracts.setters);
};

database_manager.prototype.getSetter = function (fieldName, callback) {
	callback(null, this.controller.contracts.setters[fieldName]);
};

database_manager.prototype.setSetter = function (fieldName, fn, callback) {
	var self = this;
	this.controller.contracts.setters.setSetter(fieldName, fn, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('setters', fieldName, callback);
		}
	});
};

/*
	Defaults functions
*/
database_manager.prototype.getDefaults = function (callback) {
	callback(null, this.controller.contracts.defaults);
};

database_manager.prototype.getDefault = function (fieldName, callback) {
	callback(null, this.controller.contracts.defaults[fieldName]);
};

database_manager.prototype.setDefault = function (fieldName, fn, callback) {
	var self = this;
	this.controller.contracts.defaults.setDefault(fieldName, fn, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('defaults', fieldName, callback);
		}
	});
};

/*
	Validator functions
*/
database_manager.prototype.getValidators = function (callback) {
	callback(null, this.controller.contracts.validators);
};

database_manager.prototype.getValidator = function (validatorName, callback) {
	callback(null, this.controller.contracts.validators[validatorName]);
};

database_manager.prototype.setValidator = function (fieldName, fn, callback) {
	var self = this;
	this.controller.contracts.validators.setValidator(fieldName, fn, function(err, msg) {
		if(err) {
			callback(true, msg);
		} else {
			self.controller.invalidateRelevantSchemas('validators', fieldName, callback);
		}
	});
};
