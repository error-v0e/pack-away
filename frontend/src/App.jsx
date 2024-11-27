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
    console.log(user);
    
    if (user) {
      console.log("--------------------------------");
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Layout className="min-h-screen">
        {/* Navigační lišta */}
        <Header>
          <CustomNavbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Header>

        {/* Hlavní obsah */}
        <Content style={{ 
            padding: "20px",
            margin: "0 auto",
            width: "100%",
          }}>
          <Routers isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Content>
      </Layout>
    </Router>
  );
}

export default App;