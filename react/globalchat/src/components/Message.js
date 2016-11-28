import React from 'react';



var Message = React.createClass({
  render() {
    return (
      <div>
        <p>{this.props.content}</p>
      </div>
    );
  }
});

module.exports = Message;
