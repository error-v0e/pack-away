import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Friends from "./pages/Friends";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Home to="/home" />} />
      <Route path="/pratele" element={<Friends />} />
    </Routes>
  );
};

export default Routers;
