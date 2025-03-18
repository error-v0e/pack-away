import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarIcon, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, } from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UsersInvite } from "../assets/UsersInvite.jsx";

const UserBar = ({ ID_trip, ID_user }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    const fetchTripMembers = async () => {
      try {
        const response = await axios.get('/api/trip-members', { params: { id_user: ID_user, id_trip: ID_trip } });
        setMembers(response.data);

      } catch (error) {
        console.error('Error fetching trip members:', error);
        setError('Error fetching trip members');
      }
    };

    fetchTripMembers();
  }, [ID_trip, ID_user]);

  const navigateToUserList = async (IDuser) => {
    navigate(`/cesta/${ID_trip}/${IDuser}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='mt-5'>
      <Flex gap='small' justify="center">
        {members.map(member => (
          <Card 
            key={member.id_user}
            className='bg-transparent border-none'
            shadow="none"
            onPress={member.joined && member.view ? () => navigateToUserList(member.id_user) : undefined}
            isPressable={member.joined && member.view}> 
            <CardBody>
              <Flex justify="center" >
                <Avatar
                  className='justify-item-center'
                  key={member.id_user}
                  size="lg"
                  src={member.picture}
                  isDisabled={!member.joined || !member.view }
                  icon={<AvatarIcon />}
                />
              </Flex>
                <p className='text-center'>{member.username}</p>
            </CardBody>
          </Card>
        ))}
        <Card 
        key={'pozvat'}
        onPress={onOpen}
        isPressable
        >
          <CardBody>
            <Flex justify="center" >
              <Avatar
                className='justify-item-center'
                key='pozvat'                  size="lg"
                icon={<UsersInvite />}
              />
            </Flex>
              <p className='text-center'>Pozvat další</p>
          </CardBody>
        </Card>
      </Flex>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
              <ModalBody>
                
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Zavřít
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserBar;