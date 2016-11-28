import React from 'react';

import HandleData from '../actions/HandleDataAction';

import sessionStore from '../stores/SessionStore';


var Inputarea = React.createClass({
  getInitialState: function () {
    return {
      sessionid: 0,
     };
  },

  componentWillMount() {
    sessionStore.on("newsessionid", this.setSessionid);
  },

  componentWillUnmount() {
    sessionStore.removeListener("newsessionid", this.setSessionid);
  },

  componentDidMount(){


    document.getElementById("input_text_field")
        .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("submit_button").click();
        }
    });
  },

  setSessionid(){
    this.setState({
      sessionid: sessionStore.getSessionid(),
    });
  },

  sendMessage(){
    var content = document.getElementById('input_text_field').value;
    document.getElementById('input_text_field').value = "";
    if(content !== ""){
      HandleData.sendMessage(content, this.state.sessionid);
    }
  },

  render() {
    return (
      <div>
        <input id="input_text_field" name="textInput" rows="1" placeholder="Schreibe eine Nachricht..." />
        <button id="submit_button" type="button" name="button" onClick={this.sendMessage}>&#10148;</button>
      </div>
    );
  }
});

module.exports = Inputarea;
