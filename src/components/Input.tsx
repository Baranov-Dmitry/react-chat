import { arrayUnion, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db } from '../firebase';
import { v4 as uuid } from 'uuid';
import { User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';

const addAvatar = require('../img/addAvatar.png');


const Input = () => {

  const currentUser = useContext(AuthContext) as User;
  const { state } = useContext(ChatContext)

  // Изменить на useReduser потому что нужно обновить два стейта одновременно 
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleClick = async () => {

    if (!file && text.length === 0) return

    if (!!file) {

      const storageRef = ref(storage, uuid())
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log(downloadURL);

            // если мы загрузили изображение то нужно его схранить в chats c текстом если он есть
            await updateDoc(doc(db, "chats", state.chatID), {
              messages: arrayUnion({
                uid: uuid(),
                senderId: currentUser?.uid,
                time: Timestamp.now(),
                image: downloadURL,
                ...getFildInObj("text", text)
              })
            });

          });
        }
      );

    } else {
      await updateDoc(doc(db, "chats", state.chatID), {
        messages: arrayUnion({
          uid: uuid(),
          senderId: currentUser?.uid,
          time: Timestamp.now(),
          text: text
        })
      });
    }

    try {

      const updateLastMsg = {
        [state.chatID + ".lastMessage"]: {
          text: text.length ? text : "Image" // В последнее сообщение сохраняем "Image" чтобы в после last-message дать понять что последнее соббщение это изоюражение 
        },
        [state.chatID + ".date"]: serverTimestamp(),
      }

      await updateDoc(doc(db, "userChat", currentUser.uid,), updateLastMsg);

      await updateDoc(doc(db, "userChat", state.uid,), updateLastMsg)

    } catch (error) {
      console.log(error)
    }

    setText("")
    setFile(null)

  }

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imagesTypes = ["image/gif", "image/jpeg", "image/png", "image/svg+xml"]
    if (e.target.files?.length && imagesTypes.indexOf(e.target.files[0].type) >= 0) {
      setFile(e.target.files[0])
      console.log("handleAddFile", e.target.files[0]);
    } else {
      // Добавить оботражение ошибки
      console.log("You can download only images");
    }
  }

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        value={text}
        onChange={e => { setText(e.target.value) }}
      />
      <div className="send">
        <input
          type="file"
          id="file"
          placeholder='Add file'
          onChange={handleAddFile}
          style={{ display: "none" }}
        />
        <label htmlFor="file">
          <img src={addAvatar} alt="add" />
        </label>
        <button onClick={handleClick} >Send</button>
      </div>
    </div>
  );
}

// Если хотим вернуть обьект и не знаем название возвращаемого поля [indes: string] так мы указываем только type поля
// usage {...getFildInObj(fildName, value)}
const getFildInObj = function (property: string, str: string): { [indes: string]: string } | undefined {
  if (str.length) return {
    [property]: str
  }
}

export default Input