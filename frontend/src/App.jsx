import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";
import CustomNavbar from "./components/Navbar.jsx";
import Routers from "./Routers";

const { Header, Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/check-session', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
  
    checkSession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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