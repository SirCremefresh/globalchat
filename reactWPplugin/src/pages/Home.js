import React from 'react';

import sessionStore from '../stores/SessionStore';
import MessageStore from '../stores/MessageStore';

import Inputarea from '../components/Inputarea';
import Message from '../components/Message';

var Home = React.createClass({
  getInitialState: function () {
    return {
      sessionid: 0,
      content: [],
      messagesstyle: {
        width: 100,
        height: 100
      }
     };
  },

  componentWillMount() {
    sessionStore.on("newsessionid", this.setSessionid);
    MessageStore.on("newmessages", this.setMessages);
  },

  componentDidMount() {
    var width = document.getElementById('globalchat13x5fjaskld').offsetWidth;
    var height = document.getElementById('globalchat13x5fjaskld').offsetHeight;
    if (height < 120) {
      height = 120;
    }
    this.setState({
      messagesstyle: {
        width: width,
        height: height
      }
    });

    var messagesdiv = document.getElementById("messages");
    messagesdiv.scrollTop = messagesdiv.scrollHeight;
  },

  componentDidUpdate(){
    var messagesdiv = document.getElementById("messages");
    messagesdiv.scrollTop = messagesdiv.scrollHeight;
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
        <div id="messages" style={this.state.messagesstyle}>
          {messages}
        </div>
        <Inputarea/>
      </div>
    );
  }
});

module.exports = Home;
