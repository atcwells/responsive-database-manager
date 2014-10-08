var util = require('../../util/util.js');

module.exports = init = function(options) {
  return new mongooseMandatoryProperties(options);
};

mongooseMandatoryProperties = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.mandatoryProperties = this._DEFAULTS;
  for (var key in this.mandatoryProperties) {
    this.logger.info('Found mandatory property with name: ' + key + ', with default value: ' + this.mandatoryProperties[key]);
  }
};

mongooseMandatoryProperties.prototype.addMandatoryProperty = function(fieldName, defaultValue, callback) {
  if(this.mandatoryProperties[fieldName]) {
    callback(true, 'The mandatory field property you have specified does already exists');
  } else {
    this.mandatoryProperties[fieldName] = newDefaultValue
    callback(null, 'Mandatory Field property: [' + fieldName + '] has been created with default value: [' + newDefaultValue + ']')
  }
};

mongooseMandatoryProperties.prototype.changeMandatoryProperty = function(fieldName, newDefaultValue, callback) {
  if(!this.mandatoryProperties[fieldName]) {
    callback(true, 'The mandatory field property you have specified does not exist');
  } else {
    this.mandatoryProperties[fieldName] = newDefaultValue
    callback(null, 'Mandatory Field Property: [' + fieldName + '] has been updated with default value: [' + newDefaultValue + ']')
  }
};

mongooseMandatoryProperties.prototype.removeMandatoryProperty = function(fieldName, callback) {
  if(this._DEFAULTS[fieldName]) {
    callback(true, 'The mandatory field property you have specified is an out of the box field, and so cannot be removed [' + fieldName + ']');
  } else if (!this.mandatoryProperties[fieldName]) {
    callback(true, 'The mandatory field property you have specified does not exist [' + fieldName + ']');
  } else {
    delete this.mandatoryProperties[fieldName];
    callback(null, 'Mandatory field property removed successfully [' + fieldName + ']');
  }
};

mongooseMandatoryProperties.prototype.checkContractSync = function(schemaFields) {
  for(var schemaFieldKey in schemaFields) {
    for(var propertyKey in this.mandatoryProperties){
      if(!schemaFields[schemaFieldKey][propertyKey]){
          this.logger.warn('Couldn\'t find mandatory field property: ' + propertyKey + ' for field [' + schemaFieldKey + ']');
            return false;
      }
    }
  }
  return true;
};

mongooseMandatoryProperties.prototype.applyMandatoryPropertiesSync = function(schemaFields) {
  for(var schemaFieldKey in schemaFields) {
    for(var propertyKey in this.mandatoryProperties){
      if(!schemaFields[schemaFieldKey][propertyKey]){
        schemaFields[schemaFieldKey][propertyKey] = this.mandatoryProperties[propertyKey]
        this.logger.warn('Added mandatory field property: ' + propertyKey + ' to field [' + schemaFieldKey + ']');
      }
    }
  }
  return schemaFields;
};

mongooseMandatoryProperties.prototype._DEFAULTS = {
  'read_only': 'false',
  'mandatory': 'false',
  'visible': 'true',
  'type': 'string',
  'display_name': 'New field'
}
