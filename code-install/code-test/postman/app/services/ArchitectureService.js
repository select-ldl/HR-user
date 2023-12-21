const { exec } = require('child_process');
const _ = require('lodash');
const ipcMain = pm.sdk.IPC;


/**
 * Function responsible to give host architecture on which the application launched on
 * @returns Promise <string>
 */
function getHostArch () {
  return new Promise((resolve, reject) => {
    if (_.includes(process.platform, 'win32')) {
      // Case where running 64 bit binary on an 64 bit arch machine
      if (_.includes(process.env.PROCESSOR_ARCHITECTURE, '64')) {
        resolve('x64');
      }

      // Case where running 32 bit binary on an 64 bit arch machine
      if (_.includes(process.env.PROCESSOR_ARCHITECTURE, 'x86') && process.env.PROCESSOR_ARCHITEW6432) {
        resolve('x64');
      }

      // Case where running 32 bit binary on an 32 bit arch machine
      if (_.includes(process.env.PROCESSOR_ARCHITECTURE, 'x86')) {
        resolve('ia32');
      }

      resolve('null');
    }

    if (_.includes(process.platform, 'linux')) {
      let linuxCommand = `arch_name="$(uname -m)"
                  if [ "$arch_name" = "x86_64" ]; then
                    echo "x64"
                  elif [ "$arch_name" = "i686" ]; then
                    echo "x32"
                  else
                    echo "Unknown architecture: $arch_name"
                  fi`;
      exec(linuxCommand, (error, stdout, stderr) => {
        if (error) {
          pm.logger.info(`~HostArchitectureService error: ${error}`);
          reject('null');
        }

        // Case where running 64 bit binary on an 64 bit arch machine
        if (_.includes(stdout, '64')) {
          resolve('x64');
        }

        // Case where running 64 bit binary on an 32 bit arch machine
        if (_.includes(stdout, '32')) {
          resolve('x32');
        }

        resolve('null');
      });
    }

    if (_.includes(process.platform, 'darwin')) {
      let macOsCommand = `arch_name="$(uname -m)"
                  if [ "$arch_name" = "x86_64" ]; then
                    if [ "$(sysctl -in sysctl.proc_translated)" = "1" ]; then
                      # Case where running 64 bit binary on an arm64 bit arch machine
                      echo "arm64"
                    else
                      # Case where running 64 bit binary on an 64 bit arch machine
                      echo "x64"
                    fi
                  elif [ "$arch_name" = "arm64" ]; then
                    # Case where running arm64 bit binary on an arm64 bit arch machine
                    echo "arm64"
                  else
                    echo "$arch_name"
                  fi`;

      exec(macOsCommand, (error, stdout, stderr) => {
        if (error) {
          pm.logger.info(`~HostArchitectureService error: ${error}`);
          reject('null');
        }

        if (_.includes(stdout, 'arm64')) {
          resolve('arm64');
        }

        if (_.includes(stdout, 'x64')) {
          resolve('x64');
        }

        resolve(stdout.trim());
      });
    }
  });
}

class ArchitectureService {
  init () {
    ipcMain.handle('getHostArchitecture', function (event, arg) {
      return new Promise((resolve, reject) => {
        getHostArch().then((arch) => {
          resolve(arch);
        }).catch((err) => {
          pm.logger.info('~ArchitectureService~Swallow the error while checking host architecture', err);
          resolve('null');
        });
      });
    });
  }
}

module.exports = new ArchitectureService();
