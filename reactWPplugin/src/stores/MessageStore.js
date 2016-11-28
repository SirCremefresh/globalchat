import { EventEmitter } from "events";

import dispatcher from "../dispatcher";


class Messagestore extends EventEmitter {
  constructor() {
    super()
    this.messages = [];
  }

  setmessages(newmessages) {
    for (var messagekey in newmessages) {
      this.messages[this.messages.length] = newmessages[messagekey];
    }
  }

  addmessages(message, sessionid) {
    var newmessage = {content: message, sessionid: sessionid}
    this.messages[this.messages.length] = newmessage;
  }

  getmessages() {
    return this.messages;
  }

  handleActions(action) {
    // warnung für kein default case ausschalten
    // eslint-disable-next-line
    switch(action.type) {
      case "SET_MESSAGE":
        this.setmessages(action.messages);
        this.emit("newmessages");
        break;
      case "NEW_MESSAGE": {
        this.addmessages(action.content, action.sessionid)
        this.emit("newmessages");
        break;
      }
    }
  }
}

const messagestore = new Messagestore();
dispatcher.register(messagestore.handleActions.bind(messagestore));

export default messagestore;
