import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarIcon, Card, CardBody, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, CardHeader} from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UsersInvite } from "../assets/UsersInvite.jsx";

const UserBar = ({ ID_trip, ID_user }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {isOpen: isOpen1, onOpen: onOpen1, onClose: onClose1} = useDisclosure();
const {isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2} = useDisclosure();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchTripMembers();
  }, [ID_trip, ID_user]);
  const updatePermissions = async (id_user, view, edit) => {
    try {
      await axios.post('/api/update-permissions', {
        id_trip: ID_trip,
        id_user: id_user,
        id_friend: ID_user,
        view,
        edit,
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };
  const fetchTripMembers = async () => {
    try {
      const response = await axios.get('/api/trip-members', { params: { id_user: ID_user, id_trip: ID_trip } });
      setMembers(response.data);
      console.log(members);

    } catch (error) {
      console.error('Error fetching trip members:', error);
      setError('Error fetching trip members');
    }
  };
  const fetchFriends = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/not-member-friends`, { params: { id_user, ID_trip } }, { withCredentials: true });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };
  const inviteFriends = async (invitedUserId) => {
    try {
      await axios.post('/api/add-trip-member', {
        id_trip: ID_trip,
        invited_user: invitedUserId,
      }, { withCredentials: true });

      fetchFriends();
      fetchTripMembers();
    } catch (error) {
      console.error('Error inviting friend:', error);
    }
  };
  const navigateToUserList = async (IDuser) => {
    navigate(`/cesta/${ID_trip}/${IDuser}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='mt-5'>
      <div className='flex flex-wrap justify-center'>
        <Card 
        key={'prava'}
        onPress={onOpen2}
        isPressable
        >
          <CardBody>
            <Flex justify="center" >
              <Avatar
                className='justify-item-center'
                key='prava'                  size="lg"
                icon={<UsersInvite />}
              />
            </Flex>
              <p className='text-center'>Oprávnění</p>
          </CardBody>
        </Card>
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
        onPress={onOpen1}
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
      </div>
      <Modal isOpen={isOpen1} onOpenChange={onClose1}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Vaši přátelé co nejsou v této cestě</ModalHeader>
              <ModalBody>
              {friends.map(friend => (
                <Card key={friend.id_user} className="w-full">
                  <CardHeader className="justify-between">
                    <div className="flex gap-5">
                      <Avatar radius="full" size="md" src={friend.picture} />
                      <div className="flex flex-col items-start justify-center mr-3">
                        <h4 className="text-small font-semibold leading-none text-default-600 ">{friend.username}</h4>
                      </div>
                    </div>
                    <Button onPress={() => inviteFriends(friend.id_user)}>
                      Pozvat
                    </Button>
                  </CardHeader>
                </Card>
              ))}
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
      <Modal isOpen={isOpen2} onOpenChange={onClose2}>
        <ModalContent>
          {(onOpen2) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Oprávnění</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2 py-2">
                  {members.map(member => (
                    <Card key={member.id_user} className="w-full">
                      <CardHeader className="justify-between">
                        <div className="flex gap-5">
                          <Avatar radius="full" size="md" src={member.picture} />
                          <div className="flex flex-col items-start justify-center mr-3">
                            <h4 className="text-small font-semibold leading-none text-default-600">{member.username}</h4>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 py-2">
                          <div className="flex gap-3 justify-between my-1 mt-3">
                            <span>Číst seznam</span>
                            <Switch
                              defaultSelected={member.view2}
                              aria-label="view2"
                              onValueChange={async (isSelected) => {
                                try {
                                  if (!isSelected) {
                                    // If view2 is set to false, also set edit2 to false
                                    await updatePermissions(member.id_user, false, false);
                                  } else {
                                    await updatePermissions(member.id_user, true, member.edit2);
                                  }
                                  fetchTripMembers(); // Refresh members to reflect changes
                                } catch (error) {
                                  console.error('Error updating permissions:', error);
                                }
                              }}
                            />
                          </div>
                          <div className="flex gap-3 justify-between">
                            <span>Vyplňovat seznam</span>
                            <Switch
                              defaultSelected={member.edit2}
                              aria-label="edit2"
                              isDisabled={!member.view2} // Disable edit2 if view2 is false
                              onValueChange={async (isSelected) => {
                                try {
                                  if (!isSelected) {
                                    // If view2 is set to false, also set edit2 to false
                                    await updatePermissions(member.id_user, member.view2, false);
                                  } else {
                                    // If view2 is set to true, retain the current edit2 state
                                    await updatePermissions(member.id_user, member.view2, true);
                                  }
                                  fetchTripMembers(); // Refresh members to reflect changes
                                } catch (error) {
                                  console.error('Error updating permissions:', error);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onOpen2}>
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