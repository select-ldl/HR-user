const IPC = require('./ipc'),
  { spawn, IPCNode } = require('../preload/desktop/node-process');


module.exports = {
  IPC,
  NodeProcess: { spawn },
  IPCNode
};
