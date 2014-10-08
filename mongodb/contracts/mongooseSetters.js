module.exports = init = function(options) {
  return new mongooseSetters(options);
}

mongooseSetters = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.setters = this._DEFAULTS;
  for (var key in this.setters) {
    this.logger.info('Found setter with name: ' + key);
  }
  return this;
}

mongooseValidators.prototype.setSetter = function(fieldName, fn, callback) {
  this.setters[fieldName] = fn;
  callback(null, "Field setter [" + fieldName + '] updated successfully');
};

mongooseSetters.prototype.applySettersSync = function(fieldName, field) {
  if(this.setters[fieldName]){
    field.set = this.setters[fieldName];
  } else {
    delete field.set;
  }
  return field;
}

mongooseSetters.prototype._DEFAULTS = {
  objectid : function(value) {
    if (value === "") {
        return null;
    } else {
      return value;
    }
  },
  string : function(value) {
    return value;
  }
}
