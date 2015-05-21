# Hubot Rate Limiter

## What is this?

Sometimes, Hubot can get a little annoying. 

Let's say you have a script that makes Hubot say 'hammertime' every time somebody uses the word 'stop':

    module.exports = (robot) ->
      robot.hear /stop/i, (msg) ->
        msg.send 'Hammertime.'
    
When this occasionally happens, it's kind of funny. But if you're having a conversation where you trigger it in almost every message, it can be a pain:

![Hammertime.](http://i.imgur.com/5n5chQt.png)

With **Hubot Rate Limiter**, you can add a rate limit to Hubot commands, so that once they're triggered, they won't be triggered again until a certain period has elapsed.

## How do I use it?

You don't call it directly, instead, just include the script and then emit an event with a callback.

    robot.emit 'rate-limit', key, limitTimeMilliseconds, callback
    
* *key* is a key you specify for the command, which is used to store it in the Redis brain (which keeps track of which commands are currently rate limited)
* *limitTimeMilliseconds* is how long you'd like to wait before the command can be triggered again. To use the default timeout of 5 minutes, use 0 for this argument.
* *callback* is the code you want to execute if the command isn't currently rate limited.

Here's an example, using the earlier Hubot script:

    module.exports = (robot) ->
      robot.hear /stop/i, (msg) ->
        robot.emit 'rate-limit', 'hammertime', 0, () ->
          msg.send 'Hammertime.'
          
So, when Hubot responds to this, the callback is only executed if the command is not currently rate limited.

## Installation via NPM

Run the following command to install this module as a Hubot dependency

```
npm install hubot-rate-limiter --save
```

Confirm that hubot-standup-alarm appears as a dependency in your Hubot package.json file.

```
"dependencies": {
  "hubot":              "2.x",
  "hubot-scripts":      "2.x",
  "hubot-rate-limiter": "*"
}
```

To enable the script, add the hubot-standup-alarm entry to the external-scripts.json file (you may need to create this file).

```
  ["hubot-rate-limiter"]
```

## Contributing

Feel free! Send a pull request :)
