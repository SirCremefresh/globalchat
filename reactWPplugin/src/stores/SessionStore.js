import { EventEmitter } from "events";

import dispatcher from "../dispatcher";


class SessionStore extends EventEmitter {
  constructor() {
    super()
    this.sessionid = 0;
  }

  setSessionid(newsessionid) {
    this.sessionid = newsessionid;
  }

  getSessionid(){
    return this.sessionid;
  }

  handleActions(action) {
    // warnung für kein default case ausschalten
    // eslint-disable-next-line
    switch(action.type) {
      case "NEW_SESSIONID": {
        this.setSessionid(action.sessionid);
        this.emit("newsessionid");
        break;
      }
    }
  }

}

const sessionStore = new SessionStore();
dispatcher.register(sessionStore.handleActions.bind(sessionStore));

export default sessionStore;
