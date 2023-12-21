const ipcMain = require('electron').ipcMain;

class IPC {
  subscribe (channel, listener) {
    const customListener = (event, ...args) => {

      const originalEventReply = event.reply;
      event.reply = (channel, data) => {
        try {
          originalEventReply(channel, data);
        }
        catch (err) {
          pm.logger.error('IPC Main: Bad usage of IPC', { channel, data, err });

          let newData;
          try {
            newData = JSON.parse(JSON.stringify(data));

            originalEventReply(channel, newData);
          }
          catch (error) {
            pm.logger.error('IPC Main: Bad usage of IPC, cannot stringify circular/BigInt referenced object', { channel, newData, error });
          }
        }
      };

      listener(event, ...args);
    };

    ipcMain.on(channel, customListener);

    return function unsubscribe () {
      ipcMain.removeListener(channel, customListener);
    };
  }

  handle (channel, listener) {
    ipcMain.handle(channel, listener);
  }
}

module.exports = new IPC();
