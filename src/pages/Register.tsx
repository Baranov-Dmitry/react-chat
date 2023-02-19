import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react'
import { auth, storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const addAvatar = require('../img/addAvatar.png');

const Register = () => {

  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [file, setFile] = useState<File>()
  const [err, setErr] = useState<Array<string>>([])

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();

    if (!validateAll()) { return; }

    try {
      // type UserCredential регестрируем нового пользователя возвращаем промис
      const resp = await createUserWithEmailAndPassword(auth, email, password);

      // 
      const storageRef = ref(storage, displayName);

      const uploadTask = uploadBytesResumable(storageRef, file as File);

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
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
          setErr(["Some error"]);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log('File available at', downloadURL);

            // в этих трех ф-х await могут быть ошибки TODO: написать проверку
            await updateProfile(resp.user, {
              displayName,
              photoURL: downloadURL
            })

            // doc 
            // setDoc - отправляем данные на сервер
            await setDoc(doc(db, "users", resp.user.uid), {
              uid: resp.user.uid,
              displayName,
              email,
              photoURL: downloadURL
            });

            await setDoc(doc(db, "userChat", resp.user.uid), {})

            navigate("/")

          });
        }
      );

    } catch (error) {
      //setErr(error as string);
      console.log(error);
    }
  }

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    if (checkFileType(e.target.files[0])) {
      setFile(e.target.files[0])
    } else {
      e.target.value = "";
      setErr(["An image should be in png, jpg or svg format"]);
    }
  }

  const validateAll = () => {
    let errString = [];

    if (displayName.length <= 3) {
      errString.push("Name should be at least 4 character")
    }

    if (validateEmail(email)) {
      errString.push("Enter an email in format like this: mailbox@some.com")
    }

    if (password.length < 6) {
      errString.push("Password should be at least 6 character")
    }

    if (!file) {
      errString.push("Add an profile picture")
    }

    if (errString.length !== 0) {
      setErr(errString);
      return false;
    } else {
      return true;
    }

  }

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat Example</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="display name" onChange={(e) => setDisplayName(e.target.value)} value={displayName} />
          <input type="email" placeholder="e-mail" onChange={(e) => setEmail(e.target.value)} value={email} />
          <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} value={password} />
          <input type="file" id="file" onChange={handleAddFile} />
          <label htmlFor="file">
            <img src={addAvatar} alt="" />
            <span>Add an avatar</span>
          </label>
          <button >Sign up</button>
          <div className="error-container">
            {err.length
              ? err.map((string, index) => <ErrorSpan key={index} text={string} />)
              : null
            }
          </div>
        </form>
        <p>
          You do have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

const checkFileType = (file: File) => {
  const imagesTypes = ["image/gif", "image/jpeg", "image/png", "image/svg+xml"]
  if (imagesTypes.indexOf(file.type) !== -1) {
    return true
  } else {
    return false
  }
}

export default Register;

const ErrorSpan = ({ text }: { text: string }) => {
  return (
    <div className="error-container__item">{text}</div>
  )
}

function validateEmail(email: string): boolean {
  return !String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};