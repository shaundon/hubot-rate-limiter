# Description:
#   Allows commands to be executed with a rate limit to prevent them being called too much.
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   No commands - called from inside scripts
#
# Author:
#   Shaun Donnelly <https://github.com/shaundon>

Fs = require 'fs'
Path = require 'path'

module.exports = (robot) ->
  scriptsPath = Path.resolve __dirname, 'scripts'
  Fs.exists scriptsPath, (exists) ->
    if exists
      robot.loadFile scriptsPath, file for file in Fs.readdirSync(scriptsPath)