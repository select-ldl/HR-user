/**
 * IMPORTANT: This file needs to be loaded as early as possible when the app starts
 */

global.pm = global.pm || {};

pm.logger = console; // Default it to console.
pm.sdk = require('./sdk/index');
