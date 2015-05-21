# Hubot Rate Limiter

Sometimes, Hubot can get a little annoying. 

Let's say you have a script that makes Hubot say 'hammertime' every time somebody uses the word 'stop':

    module.exports = (robot) ->
      robot.hear /stop/i, (msg) ->
        msg.send 'Hammertime.'
    
When this occasionally happens, it's kind of funny. But if you're having a conversation where you trigger it in almost every message, it can be a pain:


    


