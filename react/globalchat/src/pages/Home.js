import React from 'react';

import sessionStore from '../stores/SessionStore';
import MessageStore from '../stores/MessageStore';

import Inputarea from '../components/Inputarea';
import Message from '../components/Message';

var Home = React.createClass({
  getInitialState: function () {
    return {
      sessionid: 0,
      content: []
     };
  },

  componentWillMount() {
    sessionStore.on("newsessionid", this.setSessionid);
    MessageStore.on("newmessages", this.setMessages);
  },

  componentWillUnmount() {
    sessionStore.removeListener("newsessionid", this.setSessionid);
    MessageStore.removeListener("newmessages", this.setMessages);
  },

  setSessionid(){
    this.setState({
      sessionid: sessionStore.getSessionid(),
    });
  },

  setMessages(){
    this.setState({
      content: MessageStore.getmessages(),
    });
  },

  render() {
    const messages = this.state.content.map((arr, index) => {
      var key = arr.sessionid+index;
      return <Message content={arr.content} key={key}/>;
    });


    return (
      <div>
        {messages}
        <Inputarea/>
      </div>
    );
  }
});

module.exports = Home;
