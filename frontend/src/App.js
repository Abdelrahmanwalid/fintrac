import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"; // Import CSS file
import WelcomePage from "./pages/WelcomePage"; // Import WelcomePage component
import Login from "./pages/Login"; // Import Login component
import SignUp from "./pages/SignUp"; // Import SignUp component
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} /> {/* Default route to WelcomePage */}
          <Route path="/login" element={<Login />} /> {/* Route to Login page */}
          <Route path="/signup" element={<SignUp />} /> {/* Route to SignUp page */}
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;