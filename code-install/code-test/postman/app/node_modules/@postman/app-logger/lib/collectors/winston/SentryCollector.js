const WinstonCollector = require('./WinstonCollector'),
    WinstonSentryTransport = require('../../transports/winston/SentryTransport'),
    { ERROR } = require('../../constants/level');

/**
 * @extends WinstonCollector
 * @class WinstonSentryCollector
 * @description This holds the basic details winston sentry collector
 */
class WinstonSentryCollector extends WinstonCollector {
    /**
     * @method constructor
     * @description It calls the super with the winston sentry transport as its transport module
     * @param {[Object={}]} options
     * @param {Object} options.sentry
     * @throws InvalidParamsException
     */
    constructor (options = {}) {

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('InvalidParamsException: options should be of type object if provided');
        }

        super(Object.assign(
            {},
            options,
            {
                level: ERROR, // Only errors are sent to sentry
                transports: [new WinstonSentryTransport({ sentry: options.sentry })]
            })
        );
    }

    /**
     * @description For Sentry, switching log level should not be allowed.
     * Which would otherwise lead to info/warn messages to be sent to Sentry
     * @param {String} level should be among the valid log levels
     * @override
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars, no-empty-function
    setLogLevel (level) { }
}

module.exports = WinstonSentryCollector;
