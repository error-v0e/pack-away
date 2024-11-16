import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button } from '@nextui-org/react';
import { Layout } from 'antd';

const { Content } = Layout;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      alert(response.data.message);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Content style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <h1>Login</h1>
        <Input
          clearable
          underlined
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input.Password
          clearable
          underlined
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button color="primary" onPress={handleLogin}>
          Login
        </Button>
      </Content>
    </Layout>
  );
};

export default Login;