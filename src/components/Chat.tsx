import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import Input from "./Input";
import Messages from "./Messages";
const cam = require('../img/cam.png');
const add = require('../img/add.png');
const more = require('../img/more.png');

const Chat = () => {

  const { state } = useContext(ChatContext);

  return (
    <div className="chat">
      {state.chatID !== "null" ?
        <>
          <div className="chatInfo">
            <span>{state.displayName}</span>
            <div className="chatIcons">
              <img src={cam} alt="" />
              <img src={add} alt="" />
              <img src={more} alt="" />
            </div>
          </div>
          <Messages />
          <Input />
        </>
        : <div className="chat__select-chat">Select chat to start chatting</div>
      }
    </div>
  );
};

export default Chat;