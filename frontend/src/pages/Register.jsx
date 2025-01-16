import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { Input, Button, Card, Spacer, CardHeader, CardBody, CardFooter, Link, Chip } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
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

  const handleRegister = async () => {
    try {
      const response = await axios.post(`/api/register`, { username, email, password, picture });
      if (response.data.redirect) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('id_user', JSON.stringify(response.data.id_user));
        setIsAuthenticated(true); // Update authentication status
        navigate(response.data.redirect);
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
      <Card>
        <CardHeader>
          <h1>Register</h1>
        </CardHeader>
        <CardBody>
          {errors.form && <Chip color="danger">{errors.form}</Chip>}
          <Spacer y={2} />
          <Input
            clearable
            underlined
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors((prev) => ({ ...prev, username: '' }));
            }}
            status={errors.username ? 'error' : 'default'}
          />
          <Spacer y={1} />
          {errors.username && <Chip color="danger">{errors.username}</Chip>}
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
          {errors.email && <Chip color="danger">{errors.email}</Chip>}
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
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
            status={errors.password ? 'error' : 'default'}
          />
          <Spacer y={1} />
          {errors.password && <Chip color="danger">{errors.password}</Chip>}
          <Spacer y={3} />
          <Button color="primary" onPress={handleRegister}>
            Register
          </Button>
        </CardBody>
        <CardFooter>
          <Link href="/login">Prihaseni</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;