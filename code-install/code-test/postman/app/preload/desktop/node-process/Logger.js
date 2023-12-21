const os = require('os'),
  fs = require('fs'),
  path = require('path'),
  { Originator, Collectors } = require('@postman/app-logger'),

  Logger = {
    init (options) {
      // Assign logging folder information first
      let FileCollector = Collectors.File,
        ConsoleCollector = Collectors.Console,
        origin = options.origin,
        sessionId = process.pid, // set the current process id as sessionId
        collectors = [],
        logPath = options.logPath;

      fs.mkdir(logPath, { recursive: true }, (err) => {
        try {
          if (err) {
            throw err;
          }

          // create collectors
          collectors = [
            new FileCollector({
              file: path.resolve(logPath, `${origin}.log`)
            })
          ];

          process.env.PM_BUILD_ENV !== 'production' && collectors.push(new ConsoleCollector());

          // Attach the logger to global
          pm.logger = new Originator({ origin, collectors, sessionId });
        }
        catch (e) {
          pm.logger = console; // defaults to console

          // Don't fail the boot if logger fails
          pm.logger.error('Logger - Logger initialization failed', e);
        }

        // pm.logger.info(`Logger~pm.name - ${pm}`);
        // pm.logger.info(`Logger~process.env.PM_BUILD_ENV - ${process.env.PM_BUILD_ENV}`);
        // pm.logger.info(`Logger~execPath - ${process.execPath}`);
        // pm.logger.info(`Logger~execArgv - ${JSON.stringify(process.argv)}`);
        // pm.logger.info(`Logger~cwd - ${JSON.stringify(process.cwd())}`);
        pm.logger.info(`Logger - Booting Node process( pid: ${process.pid} ) ${options.origin} ${os.platform()}-${os.release()} on ${os.arch()}`);
      });
    }
  };

module.exports = Logger;
