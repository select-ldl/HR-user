/* eslint-disable no-console */
/**
 * This is a Preload script that will be initialized before other scripts would start
 * for all window types (requester, runner and console)
 */
const common = require('../common'),
      IPC = require('./ipc'),
      { spawn, IPCNode } = require('./node-process');

const desktopAPIs = {
  IPC,
  NodeProcess: { spawn },
  IPCNode
};

const sdk = Object.assign({}, common, desktopAPIs);

global.pm = global.pm || {
    sdk,
    logger: {
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }
};

