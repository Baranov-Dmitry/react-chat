import { User } from 'firebase/auth';
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { MessageDB } from './Messages';

const defoultUserSVG: string = require('../img/user-128.svg')



const Message = ({ message }: { message: MessageDB }) => {

  const currendUser = useContext(AuthContext) as User;
  const { state } = useContext(ChatContext)

  let img = (message.senderId === currendUser.uid
    ? currendUser.photoURL
    : state.photoURL);

  if (!img) { img = defoultUserSVG }

  return (
    <div
      className="message"
    >
      <div className="messageInfo">
        <img src={img} alt="User" />
        <span>{message.time.toDate().toLocaleTimeString()}</span>
      </div>
      <div className="messageContent">{message.text}</div>
      {message.image && <img src={message.image} alt="User" />}
    </div >
  );
}

export default Message