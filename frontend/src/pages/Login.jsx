import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Card, Spacer, CardHeader, CardBody, CardFooter, Link, Chip } from '@nextui-org/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || localStorage.getItem('lastPath') || '/';

  const handleLogin = async () => {
    try {
      const response = await axios.post(`/api/login`, { username, password }, { withCredentials: true });
      if (response.data.redirect) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('id_user', JSON.stringify(response.data.id_user));
        setIsAuthenticated(true); 
        navigate(from); 
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
          <h1>Přihlášení</h1>
        </CardHeader>
        <CardBody>
          {error && <Chip color="danger">{error}</Chip>}
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Jméno"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(''); 
            }}
            status={error ? 'error' : 'default'}
          />
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Heslo"
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
              setError(''); 
            }}
            status={error ? 'error' : 'default'}
          />
          <Spacer y={2} />
          <Button color="primary" onPress={handleLogin}>
            Přihlásit se
          </Button>
        </CardBody>
        <CardFooter>
          <Link href="/register">Registrace</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;