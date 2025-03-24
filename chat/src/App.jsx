import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { useAuth } from "./hooks/useAuth";
import "./App.css";
import { OnlineUsers } from "./components/Onlineuser";
import { ChatRoom } from "./components/ChatRoom";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  console.log("user",user);
  
  return !user ? children : <Navigate to="/onlineusers" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />
        <Route
          path="/onlineusers"
          element={
            <PrivateRoute>
              <OnlineUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:receiverId"
          element={
            <PrivateRoute>
              <ChatRoom />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;
