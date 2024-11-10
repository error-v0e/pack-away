import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CustomNavbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="App">
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pratele" element={<Friends />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;