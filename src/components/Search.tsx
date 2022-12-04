import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';

interface UserFromDB {
  displayName: string,
  uid: string,
  email: string,
  photoURL: string
}

const Search = () => {

  const [state, setSearchObj] = useState({ name: "", error: "", users: [] as Array<UserFromDB> })

  const currentUser = useContext(AuthContext)

  const buttonVisible = !!state.name.length

  const searchInDB = async () => {

    const q = query(collection(db, "users"), where("displayName", "==", state.name), where("uid", "!=", currentUser?.uid))

    try {
      const array: Array<UserFromDB> = [];
      const users = await getDocs(q)

      users.forEach((doc) => {
        array.push(doc.data() as UserFromDB)
      });

      console.log(array.length)
      array.length !== 0
        ? setSearchObj(state => ({ ...state, users: array }))
        : setSearchObj(state => ({ ...state, users: [], error: "User Not found!!!" }));

    } catch (error) {
      console.log(error);
      setSearchObj(state => ({ ...state, error: error as string }));
    }

  }

  const handleClearButton = () => {
    setSearchObj((state) => ({ ...state, users: [], name: "", error: "" }))
  }

  const handleKeyDawn = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter") return;
    if (state.name.length <= 4) {
      setSearchObj(state => ({ ...state, error: "Please enter at least 4 character" }));
      return;
    } else {
      searchInDB()
    }
  }

  const handleSelectUser = async (user: UserFromDB) => {
    if (!currentUser) return

    /*
      создать коллекцию по id + id и массива сообщенией
    */
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid

    try {

      // получаем документ по комбинированому uid в "chats" храняться сообщения между двумя пользователями
      const res = await getDoc(doc(db, "chats", combinedId))

      // !res.exists() если документа нет значит создаем новый с пустым массивом сообщений
      if (!res.exists()) {

        // TODO: 3 промиса ниже можно запихнуть в Promice all

        await setDoc(doc(db, "chats", combinedId), { messages: [] })

        // если нет документа в массиве "chats" значит нет и информации о их переписке в "userChat"
        // их нужно создать для обоих пользователей TODO: Переписать на промис олл
        await updateDoc(doc(db, "userChat", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          [combinedId + ".date"]: serverTimestamp()
        });

        await updateDoc(doc(db, "userChat", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          },
          [combinedId + ".date"]: serverTimestamp()
        });

      }

    } catch (error) {
      console.log("handleSelectUser ", error);
      setSearchObj(state => ({ ...state, error: error as string }))
    }



  }

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          value={state.name}
          onKeyDown={handleKeyDawn}
          onChange={(e) => { setSearchObj((state) => ({ ...state, name: e.target.value, error: "" })) }}
        />
        {buttonVisible && <button onClick={handleClearButton}>X</button>}
      </div>
      {state.users.map(user => <User key={user.uid} handleClick={handleSelectUser} user={user} displayName={user.displayName} photoURL={user.photoURL} />)}
      {state.error && <span className='search__error'>{state.error}</span>}
    </div >
  );
}

const User = ({ user, photoURL, displayName, handleClick }: { user: UserFromDB, photoURL: string, displayName: string, handleClick: (val: UserFromDB) => void }) => {
  return (
    <div className="userChat" onClick={() => handleClick(user)} >
      <img src={photoURL} alt="" />
      <div className="userChatInfo">
        <span>{displayName}</span>
      </div>
    </div>
  );
}

export default Search