import React from 'react'
import { MessageDB } from './Messages';

const Message = ({ message }: { message: MessageDB }) => {
  return (
    <div
      className="message"
    >
      <div className="messageInfo">
        {message.image &&
          <img
            src={message.image}
            alt={message.image}
          />
        }
        <span>{message.time.toDate().toLocaleTimeString()}</span>
      </div>
      <div className="messageContent">{message.text}</div>
    </div >
  );
}

export default Message