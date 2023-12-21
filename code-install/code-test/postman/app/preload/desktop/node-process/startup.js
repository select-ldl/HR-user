// Make sure that global variables are available for the rest of the modules as well.
if (!global.pm) {
  global.pm = {};
}

pm.name = process.env.pm_name;
pm.logPath = process.env.pm_logPath;
pm.entryModule = process.env.pm_entryModule;

if (!pm.sdk) {
  pm.sdk = {};
}

const { IPC } = require('./IPC'),
  initializeLogger = require('./Logger').init;

global.pm.logger = console; // Have console logs until the logger is initialized.
initializeLogger({ origin: `${pm.name}-node-process`, logPath: pm.logPath }); // Initialize logger and set it to pm.logger

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  pm.logger.error(`Startup~[uncaught exception in Node Process]: ${err}`);
  if (err && err.stack) {
    pm.logger.error(err.stack);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  pm.logger.error(`Startup~[unhandled rejection in Node Process]: ${err}`);
  if (err && err.stack) {
    pm.logger.error(err.stack);
  }
});

global.pm.sdk.ipc = new IPC(pm.name, pm.logger);
pm.sdk.ipc.onReady(() => {
  process.send({ channel: 'ready' });
});

// postman-skip-import-validation
require(pm.entryModule); // Start the specified entry module
