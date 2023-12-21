class Evaluator {
    constructor () {
        this.setupListener();
        this.shimWindowFunctions();
    }

    shimWindowFunctions () {
      window.open = function () {
        pm.logger.error('window.open is not allowed from script sandbox');
      };
    }

    setupListener () {
        var oldThis = this;
        var oldJsonParser = JSON.parse;
        console.fileLog = function (fileName, message) { // eslint-disable-line no-console
            console.log(fileName + ': ' + message);
        };

        window.addEventListener('message', function (event) {
            let source = event.source;

            var command = event.data.command;

            if (command === 'sandboxEchoText') {
                event.source.postMessage({
                    'type': 'sandboxEchoResponse',
                    'result': true
                }, event.origin);
                return;
            }
        });
    }
}
