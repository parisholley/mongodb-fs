var path = require('path')
  , mongoose = require('mongoose')
  , mongodbFs = require('../lib/mongodb-fs');

// Usual mongoose code to define a schema for contact entities
mongoose.model('Contact', {
  firstName: String,
  lastName: String
});

// Initialize the server
mongodbFs.init({
  port: 27027, // Feel free to match your settings
  mocks: { // The all database is here...
    fakedb: { // database name
      contacts: [ // a collection
        {
          firstName: 'John',
          lastName: 'Doe'
        },
        {
          firstName: 'Forrest',
          lastName: 'Gump'
        }
      ]
    }
  },
  // Additionnal options
  fork: true,         // force the server to run in a separate process (default: false)
  // fork is useful to deal with async hell (client and server in same main-loop)
  //
  // Log optionnal configuration :
  log: {
    log4js: {         // log4js configuration
      appenders: [    // log4js appenders declaration (see log4js project for more informations)
        {
          type: 'console',
          category: path.basename(__filename)
        }
      ]
    },
    category: path.basename(__filename), // category used for logger
    level: 'INFO'                        // log level
  }
});

mongodbFs.start(function (err) {
  mongoose.connect('mongodb://localhost:27027/fakedb', { server: { poolSize: 1 } }, function (err) {
    // Usual mongoose code to retreive all the contacts
    var Contact;
    Contact = mongoose.connection.model('Contact');
    Contact.find(function (err, contacts) {
      //
      console.log('contacts :', contacts);
      //
      mongoose.disconnect(function (err) { // clean death
        mongodbFs.stop(function (err) {
          console.log('bye!');
        });
      });
    });
  });
});
