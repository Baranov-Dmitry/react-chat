import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { useContext, useEffect, useRef, useState } from 'react'
import { ChatContext } from '../context/ChatContext'
import { db } from '../firebase'
import Message from './Message'

export interface MessageDB {
  uid: string,
  text?: string,
  senderId: string,
  time: Timestamp,
  image?: string
}

const Messages = () => {

  const { state } = useContext(ChatContext)

  const [messages, setMessages] = useState<Array<MessageDB>>([])

  useEffect(() => {
    if (state.chatID === "null") return;

    const unSub = onSnapshot(doc(db, "chats", state.chatID), (doc) => {
      if (!doc.exists()) return;
      const arr = (doc.data() as { messages: Array<MessageDB> }).messages
      setMessages(arr);
    }, err => {
      console.log("Use Effect Messages", err);
    })

    return () => {
      unSub();
    }
  }, [state.chatID])

  // useEffect(() => {
  //   console.log("focusRef", focusRef.current)
  //   if (focusRef.current === null) return

  //   setTimeout(() => {
  //     focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  //   }, 1)

  // })

  return (
    <div className="messages">
      {messages.length
        ? <>
          {messages.map((msg, index) => <Message key={msg.uid} message={msg}
            last={messages.length - 1 === index ? true : false}
          />)}
          <FocusOnThis />
        </>
        : <div className="messages__empty-history">Message history is empty</div>}
    </div>
  )
}

function FocusOnThis() {

  const focusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 500)

  })

  return (
    <div ref={focusRef} ></div>
  )
}

export default Messages