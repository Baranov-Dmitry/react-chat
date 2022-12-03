import { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Home } from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {

  const currentUser = useContext(AuthContext);
  console.log("App Context ", currentUser, !currentUser)

  const ProtectedRoute = ({ children }: any) => {
    console.log("ProtectedRoute ")
    if (!currentUser) {
      return <Navigate to="/login" />;
    } else {
      return children;
    }
  }

  const RedirectToHomeRoute = ({ children }: any) => {
    if (currentUser) {
      return <Navigate to="/" />;
    } else {
      return children;
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="login" element={
            <RedirectToHomeRoute><Login /></RedirectToHomeRoute>}
          />
          <Route path="register" element={
            <RedirectToHomeRoute>
              <Register />
            </RedirectToHomeRoute>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
