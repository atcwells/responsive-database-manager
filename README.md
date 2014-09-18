responsive-database-manager
===========================

A Mongoose database interface that is created per JSON specs, and responds to changes to those specifications properly.

## Contents

 * [Example Usage](#example_usage)
 * [Features](#features)
 * [Events](#events)

## Example Usage

1. [Install MongoDB](http://docs.mongodb.org/manual/installation/)

## Features

This module is used extensively within a particular parent project. For this reason, a fair few decisions have been made which may not match other requirements. I've attempted to outline these decisions here:

### Mandatory Properties

A JSON file containing properties which are mandatory, and their default values. If a new field is added without one of these properties, it will be added with the default value.

### Mandatory Fields

A JSON file containing fields which are mandatory. These fields will be automatically added to new schema should the schema not already contain the fields.

### Field Types

A JSON file containing mappings between subtle types and Mongoose types. With this, you can create complex types to support better validation, but storing the data properly within Mongoose. For example:

    "email": "string",

an email type can be interpreted differently by the browser, server, but Mongoose will still store as a String type.

### Getters/Setters/Validators/Defaults

Javascript files containing functions used to perform operations against data. For example:

    module.exports = {
      password : function(value) {
        return "●●●●●●●●";
      }
    }

The above will be applied to password type fields (see Field Types - this is actually a String) in the Getters property, and thus all passwords retrieved from the database will read '●●●●●●●●' instead of their actual value.

### Schemas stored as JSON

All schema are stored as JSON files, converted using mongoose-gen, to which I owe great thanks. They contain a property called 'name', and a map called 'fields', which contains all the information required, but at a minimum contains the fields within Mandatory Properties.

## Events

Changes to `mandatory_properties` file:

  - ensure all mandatory_fields have new property

  - ensure all schemas have new property

  - if removing, do nothing.

Changes to `mandatory_fields` file:

  - ensure new mandatory field has all mandatory properties.

Changes to `field_types` file:
  - if removing, set all schemafields with matching field_type to 'string'

Changes to `defaults`/`getters`/`setters`/`validators` files:

  - update mongoose's settings so that new file is used.

  - reload all schemas?

Changes to `schema` files:

  - reload schema completely.
