import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import Home from "./pages/Home";
import Friends from "./pages/Friends";

const App = () => {
  return (
    <Router>
      <Navbar isBordered variant="floating">
        <NavbarBrand>
          <p>Pack Away</p>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem as={NavLink} to="/" end>
            Domovská stránka
          </NavbarItem>
          <NavbarItem as={NavLink} to="/pratele">
            Přátelé
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pratele" element={<Friends />} />
      </Routes>
    </Router>
  );
};

export default App;
