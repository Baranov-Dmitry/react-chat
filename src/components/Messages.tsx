import { doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { db } from '../firebase'
import Message from './Message'

export interface MessageDB {
  uid: string,
  text: string,
  senderId: string,
  time: Timestamp,
  image: string
}

const Messages = () => {

  const currentUser = useContext(AuthContext)
  const { state } = useContext(ChatContext)

  const [messages, setMessages] = useState<Array<MessageDB>>([])

  // нужно получить массив сообщений через useEffect - true
  // Вывести сообщения на экран - true
  // в инпуте написать логику нового сообщения отправить на сервер
  // должно быть 2 поля изображение и сообщение
  // В списке чатов нужно отобразить последнее сообщение
  // для этого при добовлениее нового сообщения обновить lastMessage в userChats

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

  return (
    <div className="messages">
      {messages.map(msg => <Message key={msg.uid} message={msg} />)}
    </div>
  )
}

export default Messages