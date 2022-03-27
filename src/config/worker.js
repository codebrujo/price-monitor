exports.messageTypes = {
  info: 'info',
  run: 'run',
  keepAlive: 'keepAlive',
  exit: 'exit',
  registerNewProcess: 'registerNewProcess',
  updateProcess: 'updateProcess',
  handUp: 'handUp',
};

exports.rootWorkerId = 'root';

exports.aliveTime = 10000;

exports.aliveCheckTime = 12000;

exports.exitCodes = {
  CODE_SUCCESS: 0,
};

exports.readMessageQueueInterval = 5000;
