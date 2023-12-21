const { spawn } = require('child_process'),
    { EventEmitter } = require('events'),
    path = require('path'),
    { getLogPath, getExecPath, getEntryModulePath } = require('./pathUtils');

/**
 * @returns the startup module for the node process
 */
function getStartUpModule () {
    return path.resolve(__dirname, 'startup.js');
}

/**
 * Prepares the environment variables
 * @param { Object } options the options object
 * @returns the environment variables for the Node process
 */
function getEnv (entryModule, name, options) {
    const logPath = getLogPath();
    const availableEnv = options.env || process.env;
    return {
        ...availableEnv,
        'pm_name': name,
        'pm_logPath': logPath,
        'pm_entryModule': getEntryModulePath(entryModule),
        ELECTRON_RUN_AS_NODE: 1 // Reference https://www.electronjs.org/docs/api/environment-variables#electron_run_as_node
    };
}

/**
 * Prepare the exec args for the node process
 * @param { Object } options
 * @returns {Array<String>} the prepared args - array of strings
 */
function getExecArgV (options = { inspect: false }) {
  const args = [];

  if (options.inspect) {
    args.push('--inspect'); // Reference https://nodejs.org/en/docs/guides/debugging-getting-started/#enable-inspector
  }
  args.push(getStartUpModule());

  return args;
}

/**
 * @description The NodeProcess provides the ability to spawn node process asynchronously,
 *  in a manner that is similar, but not identical to child_process.
 *  The NodeProcess will have a communication channel built-in that allows messages to be passed back and forth between the NodeProcess and the consumer process.
 * @class
 * @extends EventEmitter
 * @requires pm.logger
 */
class NodeProcess extends EventEmitter {

    /**
     * @returns { NodeProcess }
     * @param { String } modulePath The absolute path of the entry module
     * @param { String } name The name of the process, a way to identify this process. This will be used to identify log file, config files, etc.,
     * @param { Object } options The options object
     */
    constructor (modulePath, name, options) {
        super();
        this._execPath = getExecPath();
        this._execArgV = getExecArgV(options);
        this.logPath = getLogPath();
        this.name = name;
        this.entryModule = modulePath;

        this._spawnedProcess = spawn(this._execPath,
            this._execArgV,
            {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'], // Reference https://nodejs.org/api/child_process.html#child_process_options_stdio
                env: getEnv(modulePath, name, options)
            }
        );
        process.on('exit', () => {
            // Killing the child process when the parent process exits,
            // as on *nix OS the child doesn't exit when parent does so.
            // Reference https://nodejs.org/api/child_process.html#child_process_event_exit
            this.kill();
        });

        // This listener is register in order to avoid a crash
        // when no listener is attached by consumer but we emit an error event
        this.on('error', (err) => {
            pm.logger.error(`NodeProcess~Something wrong while start/killing the NodeProcess '${this.name}'`, err);
        });

        this._spawnedProcess.on('error', (err) => {
            this.emit('error', err);
        });

        this._spawnedProcess.on('exit', (code, signal) => {
            // Process terminated with error.
            if (code !== 0) {
                pm.logger.info(`NodeProcess~subprocess exited with code: ${code}`);
                if (signal) {
                    pm.logger.info(`in response to signal ${signal}`);
                }
            }
            this.emit('exit', code, signal);
        });

        this._spawnedProcess.on('message', (message) => {
            if (message.channel && message.channel === 'ready') {
                this.emit('ready');
            }
        });
    }

    onReady (listener) {
        this.on('ready', listener);
            return () => {
          this.removeListener('ready', listener);
        };
    }

    onError (listener) {
        this.on('error', listener);
            return () => {
          this.removeListener('error', listener);
        };
    }

    onExit (listener) {
        this.on('exit', listener);
            return () => {
          this.removeListener('exit', listener);
        };
    }

    /**
     * @description Sends a SIGTERM signal to the created node process.
     * @returns { Boolean } true if succeeds in sending signal, false otherwise.
     */
    kill () {
        if (!this._spawnedProcess) {
            return false;
        }
        this._spawnedProcess.connected && this._spawnedProcess.disconnect();
        return this._spawnedProcess.kill();
    }

    /**
     * @returns { Boolean } true after nodeProcess.kill() is used to successfully send a signal to the Node process.
     */
    isKilled () {
        return this._spawnedProcess.killed;
    }
}

module.exports = { NodeProcess };
