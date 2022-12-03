import { doc, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { ActionType, ChatContext } from '../context/ChatContext';
import { db } from '../firebase';

interface ChatFromDB {
  uidCombined: string,
  date: {
    nanoseconds: number,
    seconds: number
  },
  userInfo: {
    displayName: string,
    photoURL: string,
    uid: string
  },
  lastMessage?: {
    text: string
  }
}

const Chats = () => {

  /*
  1: Получить данные о чатах пользователя
  2: Подписаться на них, для этого используем useEffect для запроса после componentDidMount
  3: после клика на чат должен открыться чат с выбраным пользователем
  */

  const [userChats, setUserChats] = useState<Array<ChatFromDB>>([]);

  const currentUser = useContext(AuthContext)
  const { dispatch } = useContext(ChatContext)

  useEffect(() => {
    console.log("useEffect Chats");
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, "userChat", currentUser.uid), (doc) => {
      if (!doc.exists()) return;
      const arr = [];
      for (const [k, v] of Object.entries(doc.data())) {
        arr.push({ uidCombined: k, ...v } as ChatFromDB)
      }
      setUserChats(arr);
    });

    return () => {
      unsub()
    }
    // es lint ругаеться может как-то поменять 
  }, [currentUser?.uid]);

  function handleClick(uid: ChatFromDB): void {
    if (!dispatch) return;
    dispatch({ type: ActionType.ChangeUser, payload: uid.userInfo })
  }

  return (
    <div className="chats">
      {userChats.map(chat => {
        return (
          <div className="userChat" key={chat.userInfo.uid} onClick={() => handleClick(chat)}>
            <img src={chat.userInfo.photoURL} alt="" />
            <div className="userChatInfo">
              <span>{chat.userInfo.displayName}</span>
              <p>{chat.lastMessage && chat.lastMessage.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default Chats