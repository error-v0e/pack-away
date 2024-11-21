import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Card, Spacer, CardHeader, CardBody, CardFooter, Link, Chip } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      if (response.data.redirect) {
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data in localStorage
        setIsAuthenticated(true); // Update authentication status
        navigate(response.data.redirect);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error logging in');
      }
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div>
      <Card>
        <CardHeader>
          <h1>Login</h1>
        </CardHeader>
        <CardBody>
          {error && <Chip color="danger">{error}</Chip>}
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(''); // Clear error when user starts typing
            }}
            status={error ? 'error' : 'default'}
          />
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Password"
            value={password}
            endContent={
              <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                {isVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error when user starts typing
            }}
            status={error ? 'error' : 'default'}
          />
          <Spacer y={2} />
          <Button color="primary" onPress={handleLogin}>
            Login
          </Button>
        </CardBody>
        <CardFooter>
          <Link href="/register">Register</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;