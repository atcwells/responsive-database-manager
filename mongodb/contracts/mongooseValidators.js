module.exports = init = function(options) {
  return new mongooseValidators(options);
}

mongooseValidators = function(options) {

  this.options = options || {};
  this.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  this.validators = this._DEFAULTS;
  for (var key in this.validators) {
    this.logger.info('Found field validator with name: ' + key);
  }
  return this;
}

mongooseValidators.prototype.setValidator = function(fieldName, fn, callback) {
  this.validators[fieldName] = fn;
  callback(null, "Field validator [" + fieldName + '] updated successfully');
};

mongooseValidators.prototype.applyValidatorsSync = function(fieldName, field) {
  if(this.validators[fieldName]){
    field.validate = [this.validators[fieldName]];
  } else {
    delete field.validate;
  }
  return field;
}

mongooseValidators.prototype._DEFAULTS = {
  email : function(value) {
    return (/\S+@\S+/).test(value);
  },
  string : function(value) {
    return true;
  },
  objectid : function(value) {
    return true;
  }
}
