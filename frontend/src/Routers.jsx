import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Items from "./pages/Items";
import List from "./pages/List";
import Login from "./pages/Login";
import Register from "./pages/Register";

const Routers = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
      <Route path="/pratele" element={isAuthenticated ? <Friends /> : <Navigate to="/login" />} />
      <Route path="/polozky" element={isAuthenticated ? <Items /> : <Navigate to="/login" />} />
      <Route path="/seznam" element={isAuthenticated ? <List /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default Routers;