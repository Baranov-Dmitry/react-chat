import { User } from 'firebase/auth';
import { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { MessageDB } from './Messages';

const defoultUserSVG = "./user-128.svg"

const Message = ({ message, last }: { message: MessageDB, last: boolean }) => {

  const currendUser = useContext(AuthContext) as User;
  const { state } = useContext(ChatContext)

  const currentMessage = useRef<HTMLInputElement>(null)

  let isOwner = currendUser.uid === message.senderId ? "owner" : "";

  let img = !!isOwner ? currendUser.photoURL : state.photoURL;

  if (!img) { img = defoultUserSVG }

  // useEffect(() => {
  //   console.log("useEffect")
  //   // TODO не работает как должно скрол срабатывает только при второй загрузке
  //   currentMessage.current?.scrollIntoView({ behavior: "smooth" });
  // }, [last])

  return (
    <div
      className={"message " + isOwner}
      ref={currentMessage}
      key={message.uid}
    >
      <div className="messageInfo">
        <img src={img} alt="User" />
        <span>{getTimeFromDate(message.time.seconds)}</span>
      </div>
      <div className="messageContent" >
        <p>{message.text}</p>
        {message.image && <img src={message.image} alt="User" />}
      </div>
    </div >
  );
}

const pad = (num: number) => ("0" + num).slice(-2);

const getTimeFromDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();
  return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds)
}

export default Message