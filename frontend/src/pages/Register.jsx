import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Card, Spacer, CardHeader, CardBody, CardFooter, Divider } from '@nextui-org/react';

import {EyeFilledIcon} from "../assets/EyeFilledIcon";
import {EyeSlashFilledIcon} from "../assets/EyeSlashFilledIcon";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [picture, setPicture] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', { username, email, password });
      alert(response.data.message);
    } catch (error) {
      console.error('Error registering:', error);
    }
  };
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div>
    <Card>
      <CardHeader>
      <h1>Register</h1>
      </CardHeader>
        <CardBody>
            <Input
            clearable
            underlined
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
            <Spacer y={2} />
            <Input
            clearable
            underlined
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
        </CardBody>
    </Card>


    </div>
  );
};

export default Register;