import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Card, Spacer, CardHeader, CardBody, CardFooter, Link, Chip } from "@heroui/react";
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeFilledIcon } from "../assets/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../assets/EyeSlashFilledIcon";

const Register = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [picture, setPicture] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || localStorage.getItem('lastPath') || '/';

  const handleRegister = async () => {
    try {
      const response = await axios.post(`/api/register`, { username, email, password, picture }, { withCredentials: true });
      if (response.data.redirect) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('id_user', JSON.stringify(response.data.id_user));
        setIsAuthenticated(true); 
        navigate(from); 
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ form: 'Error registering' });
      }
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div>
      <Card className='max-w-[400px] mx-auto mt-20'>
        <CardHeader>
          <h1>Registrace</h1>
        </CardHeader>
        <CardBody>
          {errors.form && <Chip color="danger">{errors.form}</Chip>}
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Jméno"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors((prev) => ({ ...prev, username: '' }));
            }}
            status={errors.username ? 'error' : 'default'}
          />
          <Spacer y={1} />
          {errors.username && <Chip color="danger" className='whitespace-normal h-auto'>{errors.username}</Chip>}
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            status={errors.email ? 'error' : 'default'}
          />
          <Spacer y={1} />
          {errors.email && <Chip color="danger" className='whitespace-normal h-auto'>{errors.email}</Chip>}
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
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            status={errors.password ? 'error' : 'default'}
          />
          <Spacer y={1} />
          {errors.password && <Chip color="danger" className='whitespace-normal h-auto'>{errors.password}</Chip>}
          <Spacer y={3} />
          <Button color="primary" onPress={handleRegister}>
            Registrovat se
          </Button>
        </CardBody>
        <CardFooter>
          <Link href="/login">Přihlášení</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;