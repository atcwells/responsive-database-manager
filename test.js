var RDM = require('./responsive-database-manager.js');

var m = RDM({
  mongoUrl: 'mongodb://127.0.0.1:27017/test',
  schemaDirectory: '/schema',
  useMongooseFixes: true,
  backupRecords: true,
  backupDirectory: '/backups'
}, function() {
  m.schema('test').find({}, function(err, data) {
    // console.log(data);
    // console.log('menu_item')

    m.schema('test').createRecord('', {
      email : 'd@a.com'
    }, function(err, data) {
      m.schema('test').deleteRecords({
        _id: data[0]._id
      }, function(err, msg) {
        // console.log(err, msg);
      })
    });
  });


  m.getFieldTypes(function(err, data) {
    // console.log('fieldTypes')
  });

  m.getFieldType('web_address', function(err, data) {
    // console.log('fieldType')
  });
});
