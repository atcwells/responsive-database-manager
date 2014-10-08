module.exports = init = function(options) {
  return new mongooseGetters(options);
}

mongooseGetters = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.getters = this._DEFAULTS;
  for (var key in this.getters) {
    this.logger.info('Found getter with name: ' + key);
  }
  return this;
}

mongooseValidators.prototype.setGetter = function(fieldName, fn, callback) {
  this.getters[fieldName] = fn;
  callback(null, "Field getter [" + fieldName + '] updated successfully');
};

mongooseGetters.prototype.applyGettersSync = function(fieldName, field) {
  if(this.getters[fieldName]){
    field.get = this.getters[fieldName];
  } else {
    delete field.get;
  }
  return field;
}

mongooseGetters.prototype._DEFAULTS = {
  objectid : function(value) {
    return value;
  }
}
