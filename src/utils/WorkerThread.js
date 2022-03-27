const { Worker } = require('worker_threads');
const logger = require('../config/logger');
const { newMessage } = require('../utils/workersMessage');
const { messageTypes, rootWorkerId } = require('../config/worker');

class WorkerThread {
  constructor(filePath, workerId, THREAD_ID) {
    this.filePath = filePath;
    this.id = workerId;
    this.THREAD_ID = THREAD_ID;
    this.keepAlive = null;
    this.events = {};
    this.subscribe(messageTypes.keepAlive, this.updateKeepAlive);
  }

  updateKeepAlive(msg) {
    this.keepAlive = new Date();
  }

  isRunning() {
    if (!this.keepAlive) return false;
    return new Date() - this.keepAlive < aliveTime ? true : false;
  }

  subscribe(eventName, fn, thisArg = this) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push({ fn, thisArg });

    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (eventFn) => fn !== eventFn.fn
      );
    };
  }

  handleWorkerStop(code) {
    this.keepAlive = null;
    this.handleMessage(
      newMessage(this.id, rootWorkerId, messageTypes.exit, code)
    );
  }

  handleMessage(msg) {
    if (typeof msg !== 'object') return;
    const event = this.events[msg.type];
    if (event) {
      event.forEach((eventFn) => {
        eventFn.fn.call(eventFn.thisArg, msg);
      });
    }
  }

  createWorker() {
    return new Promise((resolve, reject) => {
      if (!this.id) {
        logger.error(
          `${THIS_THREAD_ID}.worker create: rejected as id is empty`
        );
        reject(new Error('No worker id defined'));
        return;
      }
      resolve(
        new Worker(this.filePath, {
          workerData: { workerId: this.id, owner: this.THREAD_ID },
        })
      );
    })
      .then((worker) => {
        worker.on('message', (msg) => this.handleMessage(msg));
        worker.on('error', (err) =>
          logger.error(`${this.THREAD_ID}: ${this.id}: ${err}`)
        );
        worker.on('exit', (code) => this.handleWorkerStop(code));
        this.worker = worker;
        this.keepAlive = new Date();
      })
      .catch((err) => {
        logger.error(`${THIS_THREAD_ID}: Failed to create worker ${this.id} 
    ${err}`);
      });
  }
}

module.exports = WorkerThread;
