import React from "react";
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button } from "@heroui/react";
import axios from 'axios';
import { PackAwayLogo } from "../assets/PackAwayLogo";

export default function CustomNavbar({ isAuthenticated, setIsAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Cesty", path: "/" },
    { name: "Přátelé", path: "/pratele" },
    { name: "Seznamy", path: "/seznamy" },
    { name: "Položky", path: "/polozky" },
  ];

  const handleLogout = async () => {
    try {
      const response = await axios.post(`/api/logout`, {}, { withCredentials: true });
      if (response.data.redirect) {
        localStorage.setItem('lastPath', location.pathname);
        localStorage.removeItem('user'); 
        localStorage.removeItem('id_user'); 
        setIsAuthenticated(false); 
        navigate(response.data.redirect);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <PackAwayLogo />
          <p className="font-bold text-inherit">Pack Away</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <PackAwayLogo />
          <p className="font-bold ms-2 text-inherit">Pack Away</p>
        </NavbarBrand>
        {menuItems.map((item, index) => (
          <NavbarItem key={index} as={NavLink} to={item.path} end>
            {item.name}
          </NavbarItem>
        ))}
        {isAuthenticated ? (
          <NavbarItem>
            <Button onClick={handleLogout} color="primary" variant="flat">
              Odhlásit se
            </Button>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem>
              <Link as={NavLink} to="/login" end>
                Přihlášení
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={NavLink} to="/register" color="primary" variant="flat">
                Registrace
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              as={NavLink}
              to={item.path}
              className="w-full"
              size="full"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {isAuthenticated ? (
          <NavbarMenuItem>
            <Button onClick={handleLogout} className="w-full" color="danger">
              Odhlásit se
            </Button>
          </NavbarMenuItem>
        ) : (
          <>
            <NavbarMenuItem>
              <Link
                as={NavLink}
                to="/login"
                className="w-full"
                size="full"
                onClick={() => setIsMenuOpen(false)}
              >
                Přihlášení
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                as={NavLink}
                to="/register"
                className="w-full"
                size="full"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrace
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}