const Joi = require('joi');
const Nconf = require('nconf');

const MQ = require('./utils/mq');
const { bindSchema, exchangeSchema, queueSchema } = require('./schemas');

class App {
  async run() {
    await this.start();
    await this.stop();
  }

  async start() {
    try {
      await this._connectToMQ();
      await this._assertExchanges();
      await this._assertQueues();
      await this._bindQueues();
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async _connectToMQ() {
    await MQ.connect(Nconf.get('AMQP_URI'));
    console.info(`God : connected to rabbitmq at ${Nconf.get('AMQP_URI')}`);
  }

  async _assertExchanges() {
    console.info('--- Asserting Exchanges ---');
    const exchanges = Nconf.get('exchanges');

    await Promise.all(
      exchanges.map(async (exchange) => {
        try {
          Joi.assert(exchange, exchangeSchema);
          await MQ.assertExchange(exchange);
        }
        catch (err) {
          console.error(`Failed asserting exchange: ${JSON.stringify(exchange)}`);
          throw err;
        }
      }),
    );

    console.info('--- Asserted Exchanges ---');
  }

  async _assertQueues() {
    console.info('--- Asserting Queues ---');
    const queues = Nconf.get('queues');

    await Promise.all(
      queues.map(async (queue) => {
        try {
          Joi.assert(queue, queueSchema);
          await MQ.assertQueue(queue);
        }
        catch (err) {
          console.error(`Failed asserting queue: ${JSON.stringify(queue)}`);
          throw err;
        }
      }),
    );

    console.info('--- Asserted Queues ---');
  }

  async _bindQueues() {
    console.info('--- Binding Queues ---');
    const binds = Nconf.get('binds');

    await Promise.all(
      binds.map(async (bind) => {
        try {
          Joi.assert(bind, bindSchema);
          await MQ.bindQueue(bind);
        }
        catch (err) {
          console.error(`Failed binding: ${JSON.stringify(bind)}`);
          throw err;
        }
      }),
    );

    console.info('--- Bound Queues ---');
  }

  // eslint-disable-next-line class-methods-use-this
  async _closeMQConnection() {
    await MQ.close();
    console.info(`God : disconnected from rabbitmq at ${Nconf.get('AMQP_URI')}`);
  }

  async stop() {
    try {
      await this._closeMQConnection();
    }
    catch (err) {
      console.error(err);
      throw err;
    }
    console.info(`God : shutting down`);
  }
}

module.exports = App;
