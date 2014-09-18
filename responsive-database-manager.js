module.exports = function init(options) {
	return new database_manager(options);
};

function database_manager(optionsObj) {
	var self = this;
    var options = optionsObj || {};
    this.logger = {
        debug : (options.logger && options.logger.debug) || console.log,
        info : (options.logger && options.logger.info) || console.log,
        warn : (options.logger && options.logger.war) || console.log,
        error : (options.logger && options.logger.error) || console.log
    };
    this.databaseOptions = options.databaseOptions;
    this.dataBackupFolder = options.databaseBackupFolder;

    this.schemaDirectory = options.schemaDirectory;
		this.mandatoryFields = options.mandatoryFields;
		this.fieldTypes = options.fieldTypes;
		this.mandatoryProperties = options.mandatoryProperties;

    this.mongoooseValidators = options.mongoooseValidators;
    this.mongoooseDefaults = options.mongoooseDefaults;
    this.mongoooseSetters = options.mongoooseSetters;
    this.mongoooseGetters = options.mongoooseGetters;

    this.useMongooseFixes = options.useMongooseFixes;

    this.production = options.production;

    return this;
}

database_manager.prototype.setup = function setup() {

};

database_manager.prototype.schema = {
	query : function() {
		return schema.model;
	},
	removeField : function() {

	},
	addField : function() {

	},
	alterField : function() {

	}
};

database_manager.prototype.fieldType = {
	removeFieldType : function() {

	},
	addFieldType : function() {

	},
	changeFieldType : function() {
console.log('changeFieldType');
	}
};

database_manager.prototype.mandatoryField = {
	removeMandatoryField : function() {

	},
	addMandatoryField : function() {

	}
};

database_manager.prototype.mandatoryProperty = {
	removeMandatoryProperty : function() {

	},
	addMandatoryProperty : function() {

	}
};


database_manager.prototype.factories = {
	setGetters : function() {

	},
	setSetters : function() {

	},
	setDefaults : function() {

	},
	setValidators : function() {

	}
};
