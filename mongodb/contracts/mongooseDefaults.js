module.exports = init = function(options) {
  return new mongooseDefaults(options);
}

mongooseDefaults = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.fieldDefaults = this._DEFAULTS;
  for (var key in this.fieldDefaults) {
    this.logger.info('Found field default with name: ' + key);
  }
  return this;
}

mongooseDefaults.prototype.setDefault = function(fieldName, fn, callback) {
  this.fieldDefaults[fieldName] = fn;
  callback(null, "Field default [" + fieldName + '] updated successfully');
};

mongooseDefaults.prototype.applyDefaultsSync = function(fieldName, field) {
  if(this.fieldDefaults[fieldName]){
    field.default = this.fieldDefaults[fieldName];
  } else {
    delete field.default;
  }
  return field;
}

mongooseDefaults.prototype._DEFAULTS = {
  date : function(value) {
    return Date.now();
  },
  email : function(value) {
    return 'e@xample.com';
  }
}
