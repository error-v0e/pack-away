import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Login from "./pages/Login";
import Register from "./pages/Register";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pratele" element={<Friends />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default Routers;