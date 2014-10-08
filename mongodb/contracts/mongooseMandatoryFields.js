var util = require('../../util/util.js');

module.exports = init = function(options) {
  return new mongooseMandatoryFields(options);
};

mongooseMandatoryFields = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.mandatoryFields = this._DEFAULTS;
  for (var key in this.mandatoryFields) {
    this.logger.info('Found mandatory field with name: ' + key);
  }
};

mongooseMandatoryFields.prototype.addMandatoryField = function(fieldName, fields, callback) {
  if(!this.mandatoryFields[fieldName]) {
    callback(true, 'The mandatory field you have specified does not exist');
  } else {
    this.mandatoryFields[fieldName] = fields;
    callback(null, 'The mandatory field [' + fieldName + ']has been changed');
  }
};

mongooseMandatoryFields.prototype.changeMandatoryField = function(fieldName, fields, callback) {
  if(!this.mandatoryFields[fieldName]) {
    callback(true, 'The mandatory field you have specified does not exist');
  } else {
    this.mandatoryFields[fieldName] = fields;
    callback(null, 'The mandatory field [' + fieldName + ']has been changed');
  }
};

mongooseMandatoryFields.prototype.removeMandatoryField = function(fieldName, callback) {
  if(!this.mandatoryFields[fieldName]) {
    callback(true, 'The mandatory field you have specified does not exist');
  } else if(this._DEFAULTS[fieldName]) {
    callback(true, 'The mandatory field you have specified exists out of the box, and so cannot be removed [' + fieldName + ']');
  } else {
    delete this.mandatoryFields[fieldName];
    callback(null, 'Mandatory field [' + fieldName + '] has been removed.');
  }
};

mongooseMandatoryFields.prototype.checkContractSync = function(schemaFields) {
  for(var key in this.mandatoryFields) {
    if(!schemaFields[key]){
      this.logger.warn('Couldn\'t find required field: ' + key);
      return false;
    }
  }
  return true;
};

mongooseMandatoryFields.prototype.applyMandatoryFieldsSync = function(schemaFields){
  for(var key in this.mandatoryFields) {
    if(!schemaFields[key]){
      schemaFields[key] = this.mandatoryFields[key];
      this.logger.warn('Added required field: ' + key);
    }
  }
  return schemaFields;
};

mongooseMandatoryFields.prototype._DEFAULTS = {
  'name': {
    'type': 'string',
    'visible': 'true',
    'mandatory': 'true',
    'read_only': 'false'
  },
  'display_name': {
    'type': 'string',
    'visible': 'true',
    'mandatory': 'true',
    'read_only': 'false'
  },
  '_created_on': {
    'type': 'date',
    'visible': 'false',
    'mandatory': 'true',
    'read_only': 'true'
  },
  '_created_by': {
    'type': 'objectid',
    'ref': 'user',
    'visible': 'false',
    'mandatory': 'true',
    'read_only': 'true'
  },
  '_updated_on': {
    'type': 'date',
    'visible': 'false',
    'mandatory': 'true',
    'read_only': 'true'
  },
  '_updated_by': {
    'type': 'objectid',
    'ref': 'user',
    'visible': 'false',
    'mandatory': 'true',
    'read_only': 'true'
  }
}
