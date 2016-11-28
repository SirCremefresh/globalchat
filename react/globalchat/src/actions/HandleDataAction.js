import dispatcher from "../dispatcher";
var W3CWebSocket = require('websocket').w3cwebsocket;
var client = new W3CWebSocket('ws://donato.gienah.uberspace.de:61910/', 'echo-protocol');

class HandleDataAction {
  constructor() {




    client.onerror = function() {
        console.log('Connection Error');
    };

    client.onopen = function() {
        console.log('WebSocket Client Connected');
    };

    client.onclose = function() {
        console.log('echo-protocol Client Closed');
    };

    client.onmessage = function(e) {
        if (typeof e.data === 'string') {
          var data = JSON.parse(e.data);

          if(data.type === "message"){
            dispatcher.dispatch({
              type: "NEW_MESSAGE",
              content: data.content,
              sessionid: data.sessionid
            });

          } else if (data.type === "messagepacket") {
            console.log(data);
            dispatcher.dispatch({
              type: "SET_MESSAGE",
              messages: data.messages
            });

          } else if (data.type === "sessionid") {
            dispatcher.dispatch({
              type: "NEW_SESSIONID",
              sessionid: data.sessionid
            });
          }
        }
    };
  }





  sendMessage(content, sessionid){
    var message = {'type': "message", 'content': content,'sessionid':sessionid};
    client.send(JSON.stringify(message));
  }

}

const handleDataAction = new HandleDataAction();

export default handleDataAction;
