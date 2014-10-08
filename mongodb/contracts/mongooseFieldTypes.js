var util = require('../../util/util.js');

module.exports = init = function(options) {
  return new mongooseFieldTypes(options);
};

mongooseFieldTypes = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.fieldTypes = this._DEFAULTS;
  for (var key in this.fieldTypes) {
    this.logger.info('Found field types with name: ' + key + ', of data type: ' + this.fieldTypes[key]);
  }
};

mongooseFieldTypes.prototype.addFieldType = function(fieldName, fieldType, callback) {
  if(!this._mongooseTypes[fieldType]) {
    callback(true, 'You have specified an invalid mongoose field type');
  } else if(this.fieldTypes[fieldName]) {
    callback(true, 'You are creating a field type that already exists');
  } else {
    this.fieldTypes[fieldName] = fieldType;
    this.logger.info('Field type: ' + fieldName + ' created with database type: ' + fieldType);
    callback(null, 'Field created successfully');
  }
};

mongooseFieldTypes.prototype.changeFieldType = function(fieldSubtype, newFieldType, callback) {
  if(!this._mongooseTypes[newFieldType]) {
    callback(true, 'You have specified an invalid mongoose field type');
  } else if(!this.fieldTypes[fieldSubtype]) {
    callback(true, 'You have specified a field type that does not exist');
  } else {
    this.fieldTypes[fieldSubtype] = newFieldType;
    this.logger.info('Field type: ' + fieldSubtype + ' changed to database type: ' + newFieldType);
    callback(null, 'Field changed successfully');
  }
};

mongooseFieldTypes.prototype.removeFieldType = function(fieldName, callback) {
  if(this._DEFAULTS[fieldName]) {
    callback(true, 'You are trying to remove a field type that is mandatory');
  } else if(!this.fieldTypes[fieldName]) {
    callback(true, 'You are trying to remove a field type that does not exist');
  } else {
    delete this.fieldTypes[fieldName];
    this.logger.info('Removed field type: ' + fieldName);
    callback(null, 'Field removed successfully');
  }
};

mongooseFieldTypes.prototype.checkContractSync = function(schemaFields) {
  var self = this;
  for(var key in schemaFields) {
    if(!this.fieldTypes[schemaFields[key].type]) {
      self.logger.error('Found invalid field type: ' + schemaFields[key].type);
      return false;
    }
  }
  return true;
};

mongooseFieldTypes.prototype.getRealFieldTypeSync = function(field) {
  if(this.fieldTypes[field]) {
    return this.fieldTypes[field];
  } else {
    return 'string'
  }
};

mongooseFieldTypes.prototype.makeInvalidFieldsStringSync = function(schemaFields) {
  for(var key in schemaFields) {
    if(this.fieldTypes[schemaFields[key].type]) {
      schemaFields[key].type = 'string';
    }
  }
  return schemaFields;
};

mongooseFieldTypes.prototype._mongooseTypes = [
  'string',
  'objectid',
  'date',
  'number'
];

mongooseFieldTypes.prototype._DEFAULTS = {
  'string': 'string',
  'largestring': 'string',
  'password': 'string',
  'web_address': 'string',
  'email': 'string',
  'objectid': 'objectid',
  'date': 'date',
  'created': 'date',
  'updated': 'date'
}
