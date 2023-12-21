const ipcRenderer = require('electron').ipcRenderer;

class IPC {
  subscribe (channel, listener) {
    ipcRenderer.on(channel, listener);

    return function unsubscribe () {
      ipcRenderer.removeListener(channel, listener);
    };
  }

  send (channel, ...args) {
    try {
      ipcRenderer.send(channel, ...args);
    }
    catch (err) {
      pm.logger.error('IPC Renderer: Bad usage of IPC', { channel, args, err });

      let newArgs;
      try {
        newArgs = JSON.parse(JSON.stringify(args));

        ipcRenderer.send(channel, ...newArgs);
      }
      catch (error) {
        pm.logger.error('IPC Renderer: Bad usage of IPC, cannot stringify circular/BigInt referenced object', { channel, newArgs, error });
      }
    }
  }

  sendToHost (channel, ...args) {
    try {
      ipcRenderer.sendToHost(channel, ...args);
    }
    catch (err) {
      pm.logger.error('IPC Renderer: Bad usage of IPC', { channel, args, err });

      let newArgs;
      try {
        newArgs = JSON.parse(JSON.stringify(args));

        ipcRenderer.sendToHost(channel, ...newArgs);
      }
      catch (error) {
        pm.logger.error('IPC Renderer: Bad usage of IPC, cannot stringify circular/BigInt referenced object', { channel, newArgs, error });
      }
    }
  }

  sendSync (channel, ...args) {
    pm.logger.warn('Sending synchronous messages over IPC is deprecated!! We recommend you to move your usage to asynchronous messaging over IPC');

    try {
       return ipcRenderer.sendSync(channel, ...args);
    }
    catch (err) {
      pm.logger && pm.logger.error && pm.logger.error('IPC Renderer: Bad usage of IPC', { channel, args, err });

      let newArgs;
      try {
        newArgs = JSON.parse(JSON.stringify(args));

        return ipcRenderer.sendSync(channel, ...newArgs);
      }
      catch (error) {
        pm.logger.error('IPC Renderer: Bad usage of IPC, cannot stringify circular/BigInt referenced object', { channel, newArgs, error });
      }
    }
  }

  invoke (channel, ...args) {
      return ipcRenderer.invoke(channel, ...args).catch((err) => {

        if (err.message === 'An object could not be cloned.') {
          pm.logger && pm.logger.error && pm.logger.error('IPC Renderer: Bad usage of IPC', { channel, args, err });

          let newArgs;
          try {
            newArgs = JSON.parse(JSON.stringify(args));

            return ipcRenderer.invoke(channel, ...newArgs);
          }
          catch (error) {
            pm.logger.error('IPC Renderer: Bad usage of IPC, cannot stringify circular/BigInt referenced object', { channel, newArgs, error });
          }
        }

        return Promise.reject(err);
      });
  }
}

module.exports = new IPC();
