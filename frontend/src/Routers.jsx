import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Items from './pages/Items';
import List from './pages/List';
import Login from './pages/Login';
import Register from './pages/Register';
import Trip from './pages/Trip'; 
import NewList from './pages/CreateList'; 
import EditList from './pages/EditList';

const Routers = ({ isAuthenticated, setIsAuthenticated }) => {
  const location = useLocation();
  const from = location.state?.from?.pathname || localStorage.getItem('lastPath') || '/';

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/pratele" element={isAuthenticated ? <Friends /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/polozky" element={isAuthenticated ? <Items /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/seznamy" element={isAuthenticated ? <List /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/novy-seznam" element={isAuthenticated ? <NewList /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/cesta/:ID_trip" element={isAuthenticated ? <Trip /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/uprava-seznamu/:ID_list" element={isAuthenticated ? <EditList /> : <Navigate to="/login" state={{ from: location }} />} />
      <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={from} />} />
      <Route path="/register" element={!isAuthenticated ? <Register setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={from} />} />
    </Routes>
  );
};

export default Routers;