const Amqp = require('amqplib');

const DURABLE = true;

let connection;
let channel;

const connect = async (url) => {
  if (!channel) {
    connection = await Amqp.connect(url);
    channel = await connection.createChannel();
  }

  return channel;
};

const assertExchange = async ({ name, type, options = {} }, verbose = true) => {
  if (verbose) {
    console.info(`Asserting exchange ${name} of type ${type} with options: ${JSON.stringify(options)}`);
  }

  // eslint-disable-next-line no-param-reassign
  options.durable = DURABLE;
  await channel.assertExchange(name, type, options);
};

const assertQueue = async ({ name, options = {} }, verbose = true) => {
  if (verbose) {
    console.info(`Asserting queue ${name} with options: ${JSON.stringify(options)}`);
  }

  // eslint-disable-next-line no-param-reassign
  options.durable = DURABLE;
  await channel.assertQueue(name, options);
};

const bindQueue = async ({ queue, exchange, patterns }, verbose = true) => {
  if (verbose) {
    console.info(`Binding queue ${queue} to exchange ${exchange} with patterns: ['${patterns.split(' ').join("', '")}']`);
  }

  await Promise.all(
    patterns.split(' ').map(async (pattern) => await channel.bindQueue(queue, exchange, pattern)),
  );
};

// eslint-disable-next-line max-len
const setUp = async (exchange, exchangeType, queue, patterns, exchangeOptions = {}, queueOptions = {}) => {
  await assertExchange(exchange, exchangeType, exchangeOptions);
  await assertQueue(queue, queueOptions);
  await bindQueue(queue, exchange, patterns);
};

const close = async () => {
  await channel.close();
  await connection.close();
};

const getMQ = () => channel;

module.exports = {
  connect,
  assertExchange,
  assertQueue,
  bindQueue,
  setUp,
  close,
  getMQ,
};
