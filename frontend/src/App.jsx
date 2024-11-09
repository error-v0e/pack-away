import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button } from "@nextui-org/react";
import Home from "./pages/Home";
import Friends from "./pages/Friends";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Cesty", path: "/" },
    { name: "Přátelé", path: "/pratele" },
  ];

  return (
    <Router>
      <div>
        <Navbar onMenuOpenChange={setIsMenuOpen}>
          <NavbarContent>
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="sm:hidden"
            />
            <NavbarBrand>
              <p className="font-bold text-inherit">Pack Away</p>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem as={NavLink} to="/" end>
              Cesty
            </NavbarItem>
            <NavbarItem as={NavLink} to="/pratele">
              Přátelé
            </NavbarItem>
          </NavbarContent>
          <NavbarMenu>
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.name}-${index}`}>
                <NavLink
                  to={item.path}
                  className="w-full"
                  size="full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </Navbar>

        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pratele" element={<Friends />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
