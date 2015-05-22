// Description:
//   Allows commands to be executed with a rate limit to prevent them being called too much.
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   No commands - called from inside scripts
//
// Author:
//   Shaun Donnelly <https://github.com/shaundon>

module.exports = function(robot) {

    robot.on('rate-limit', function(key, limitTimeMilliseconds, callback) {
        RateLimiter._doWithLimit(key, limitTimeMilliseconds, callback);
    });

    var RateLimiter = {

        constants: {
            keyPrepend: 'rate-limit.',
            masterListKey: 'rate-limit-master-list',
            defaultTimeout: 300000 // 5 minutes.
        },

        _doWithLimit: function(key, limitTimeMilliseconds, callback) {

            // Key cannot contain commas, as that's the delimiter character
            // for the master list.
            if (key.indexOf(',') !== -1) {
                throw new Error('Key cannot contain commas.');
                return;
            }

            // Prepend something to the key for consistency across keys.
            key = RateLimiter.constants.keyPrepend + key;

            // Use default timeout if none supplied.
            if (limitTimeMilliseconds === 0) {
                limitTimeMilliseconds = RateLimiter.constants.defaultTimeout;
            }

            // If we're not being rate limited.
            if (!RateLimiter._checkRateLimit(key)) {

                // Add a rate limit.
                RateLimiter._addRateLimit(key, limitTimeMilliseconds);

                // Perform the callback.
                callback();
            }
        },

        _addRateLimit: function(key, limitTimeMilliseconds) {

            // Set the key in the brain.
            robot.brain.set(key, '1');

            // Store it to the master list.
            RateLimiter._addToMasterList(key);

            // In n milliseconds, remove it from the brain
            // (and therefore remove the rate limit).
            setTimeout(function() {
                RateLimiter._removeRateLimit(key);
            }, limitTimeMilliseconds);
        },

        _checkRateLimit: function(key) {
            var active = robot.brain.get(key) || false;
            console.log(key, active);
            return active;
        },

        _removeAllRateLimits: function() {

            var masterList = RateLimiter._getMasterList();

            // For each item in the master list,
            // remove the rate limit.
            masterList.forEach(function(key) {
                RateLimiter._removeRateLimit(key);
            });

            robot.brain.remove(RateLimiter.constants.masterListKey);
        },

        _removeRateLimit: function(key) {
            robot.brain.remove(key);
            RateLimiter._removeFromMasterList(key);
        },

        _addToMasterList: function(key) {

            var masterList = RateLimiter._getMasterList();

            // Don't allow things to be added twice.
            if (masterList.indexOf(key) === -1) {

                // Add it.
                masterList.push(key);
            }

            // Save the new list to the brain.
            robot.brain.set(RateLimiter.constants.masterListKey, masterList.join(','));
        },

        _removeFromMasterList: function(key) {

            var masterList = RateLimiter._getMasterList();

            var indexOfKey = masterList.indexOf(key);

            if (indexOfKey !== -1) {
                masterList.splice(indexOfKey, 1);
            }

            robot.brain.set(RateLimiter.constants.masterListKey, masterList.join(','));
        },

        _getMasterList: function() {
            var masterList = [];

            // Get the master list.
            var masterListRaw = robot.brain.get(RateLimiter.constants.masterListKey);

            // Turn it into an array.
            if (masterListRaw) {
                masterList = masterListRaw.split(',');
            }
            return masterList;
        }
    };

    // If Hubot crashes / shut down for some reason, any timeouts
    // that were set to clear rate limits will be lost, and rate
    // limits will never expire. So, clear all rate limits on load of this script
    // to prevent this.
    /*
    At the moment I'm using a timeout for this to occur, which isn't great.
    If it happens on load without the timeout, the brain doesn't appear to be initialised.
    Events I've tried listening for that haven't worked: running, loaded.
     */
    setTimeout(function() {
        RateLimiter._removeAllRateLimits();
    }, 5000);
};