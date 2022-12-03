import { createContext, useContext, useReducer } from "react"
import { AuthContext } from "./AuthContext";

export enum ActionType {
  ChangeUser = "CHANGE_USER"
}

export type UserInfo = {
  displayName: string,
  photoURL: string,
  uid: string
}

type State = {
  chatID: string;
  displayName: string,
  uid: string,
  email: string,
  photoURL: string
}

type Action = {
  type: ActionType.ChangeUser,
  payload: UserInfo
}

export const ChatContext = createContext({} as { state: State, dispatch: React.Dispatch<Action> });

export const ChatContextProvider = ({ children }: any) => {

  const currentUser = useContext(AuthContext)

  const INITIAL_STATE: State = {
    chatID: "null",
    displayName: "",
    uid: "",
    email: "",
    photoURL: ""
  };

  const chatReduser = (state: State, action: Action) => {
    console.log(action);
    switch (action.type) {
      case ActionType.ChangeUser:
        if (!currentUser) return state;
        return {
          ...state,
          chatID:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
          uid: action.payload.uid,
          displayName: action.payload.displayName
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(chatReduser, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider >
  );

}