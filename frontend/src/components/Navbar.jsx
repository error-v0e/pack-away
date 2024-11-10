import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar as NextUINavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@nextui-org/react";

export default function CustomNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Cesty", path: "/" },
    { name: "Přátelé", path: "/pratele" },
  ];

  return (
    <NextUINavbar onMenuOpenChange={setIsMenuOpen}maxWidth="full">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand as={NavLink} to="/" end>
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
            <Link
              to={item.path}
              className="w-full"
              size="full"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextUINavbar>
  );
}