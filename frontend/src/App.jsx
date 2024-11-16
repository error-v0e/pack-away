import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";
import CustomNavbar from "./components/Navbar.jsx";
import Routers from "./Routers";

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="min-h-screen">
        {/* Navigační lišta */}
        <Header>
          <CustomNavbar />
        </Header>

        {/* Hlavní obsah */}
        <Content style={{ 
            padding: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}>
          <Routers />
        </Content>
      </Layout>
    </Router>
  );
}

export default App;