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

  // TODO: мне нужно изменить несколько состояний userName и users можно переписать на reducer - проверить переписать
  // Можно добавить анимацию скрывания и добовления пользователей в search 

  const [userName, setUserName] = useState("")
  const [users, setUsers] = useState<Array<UserFromDB>>([])
  const [err, setErr] = useState(false)

  const currentUser = useContext(AuthContext)

  const buttonVisible = !!userName.length

  console.log(buttonVisible);

  const searchInDB = async () => {
    if (userName.length <= 3) return;

    const q = query(collection(db, "users"), where("displayName", "==", userName), where("uid", "!=", currentUser?.uid))
    try {
      const users = await getDocs(q)
      const array: Array<UserFromDB> = [];

      users.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(" => ", doc.data());
        array.push(doc.data() as UserFromDB)
      });

      array.length && setUsers(array)

    } catch (error) {
      console.log(error);
      setErr(true)
    }

  }

  const handleClearButton = () => {
    // TODO: два обнавления состояние это не врено второй обдейт проебеться
    setUserName("");
    setUsers([]);
  }

  const handleKeyDawn = (e: React.KeyboardEvent<HTMLElement>) => {
    e.key === "Enter" && searchInDB()
  }

  const handleSelectUser = async (user: UserFromDB) => {
    if (!currentUser) return
    console.log(currentUser.uid, user.uid);

    /*
      создать коллекцию по id + id и массива сообщенией
    */
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid
    console.log(combinedId);
    try {

      // получаем документ по комбинированому uid в "chats" храняться сообщения между двумя пользователями
      const res = await getDoc(doc(db, "chats", combinedId))

      // !res.exists() если документа нет значит создаем новый с пустым массивом сообщений
      if (!res.exists()) {

        // TODO: 3 промиса ниже можно запихнуть в Promice all

        await setDoc(doc(db, "chats", combinedId), { messages: [] })

        // если нет документа в массиве "chats" значит нет и информации о их переписке в "userChat"
        // их нужно создать для обоих
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
    }



  }

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          value={userName}
          onKeyDown={handleKeyDawn}
          onChange={(e) => setUserName(e.target.value)}
        />
        {buttonVisible && <button onClick={handleClearButton}>X</button>}
      </div>
      {users.map(user => <User key={user.uid} handleClick={handleSelectUser} user={user} displayName={user.displayName} photoURL={user.photoURL} />)}
      {err === true && <span className='search__error'>User not found!</span>}
    </div >
  );
}

//const User = ({ fn, uid, displayName, photoURL }: { fn: (val: string) => void, uid: string, displayName: string, photoURL: string }) => {
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