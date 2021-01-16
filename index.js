const Nconf = require('nconf');

Nconf.use('memory');
Nconf.argv().env().defaults({
  NODE_ENV: 'dev',
  AMQP_URI: 'amqp://localhost:5672',
}).file({ file: './config.json' });

const App = require('./app');

const appInstance = new App();
appInstance.run();
