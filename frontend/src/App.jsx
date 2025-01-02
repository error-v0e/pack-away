import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";
import CustomNavbar from "./components/Navbar.jsx";
import Routers from "./Routers";

const { Header, Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('id_user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('id_user');
  };

  return (
    <Router>
      <Layout className="min-h-screen">
        {/* Navigační lišta */}
        <Header>
          <CustomNavbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} onLogout={handleLogout} />
        </Header>

        {/* Hlavní obsah */}
        <Content style={{ 
            padding: "20px",
            margin: "0 auto",
            width: "100%",
          }}>
          <Routers isAuthenticated={isAuthenticated} setIsAuthenticated={handleLogin} />
        </Content>
      </Layout>
    </Router>
  );
}

export default App;