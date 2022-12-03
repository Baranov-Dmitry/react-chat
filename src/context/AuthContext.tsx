import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react"
import { auth } from "../firebase";


export const AuthContext = createContext<User | null>(null);

export const AuthContextProvider = ({ children }: any) => {
  const [curentUser, setCurentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsup = onAuthStateChanged(auth, (user) => {
      setCurentUser(user);
      console.log(user);
    })

    // из useEffect возвращаем функцию в которой отписываемся от события чтобы избежать потери памяти
    return () => {
      unsup()
    }
  }, [])

  return (
    <AuthContext.Provider value={curentUser}>
      {children}
    </AuthContext.Provider >
  );

}