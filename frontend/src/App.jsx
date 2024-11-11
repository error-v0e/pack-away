import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import CustomNavbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Friends from "./pages/Friends";

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="min-h-screen">
        {/* Navigační lišta */}
        <Header >
          <CustomNavbar />
        </Header>

        {/* Hlavní obsah */}
        <Content style={{ 
            padding: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pratele" element={<Friends />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;