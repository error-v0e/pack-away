import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarIcon, PopoverContent, PopoverTrigger, Popover, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, CardHeader} from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UsersInvite } from "../assets/UsersInvite.jsx";

const UserBar = ({ ID_trip, ID_user }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchTripMembers();
    const handleClickOutside = (event) => {
      if (!event.target.closest(".popover-content") && isPopoverOpen) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [ID_trip, ID_user]);

  const fetchTripMembers = async () => {
    try {
      const response = await axios.get('/api/trip-members', { params: { id_user: ID_user, id_trip: ID_trip } });
      setMembers(response.data);
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

  const handleRightClick = (e, member) => {
    e.preventDefault();
    setSelectedMember(member);
    setIsPopoverOpen(true);
  };

  const handleCloseOnInteractOutside = (element) => {
    if (element.id === "popup") {
      return false;
    }
    return true;
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap justify-center">
        {members.map(member => (
          <Popover
            key={'p' + member.id_user}
            isOpen={isPopoverOpen && selectedMember && selectedMember.id_user === member.id_user}
            shouldCloseOnInteractOutside={handleCloseOnInteractOutside}
          >
            <PopoverTrigger>
              <Card
                key={member.id_user}
                className="bg-transparent border-none"
                shadow="none"
                onPress={member.joined && member.view ? () => navigateToUserList(member.id_user) : undefined}
                isPressable={member.joined && member.view}
                onContextMenu={(e) => handleRightClick(e, member)}
              >
                <CardBody>
                  <Flex justify="center">
                    <Avatar
                      className="justify-item-center"
                      key={member.id_user}
                      size="lg"
                      src={member.picture}
                      isDisabled={!member.joined || !member.view}
                      icon={<AvatarIcon />}
                    />
                  </Flex>
                  <p className="text-center">{member.username}</p>
                </CardBody>
              </Card>
            </PopoverTrigger>
            <PopoverContent id={`popover-${member.id_user}`}>
              <div className="px-1 py-2">
                <div className="text-small">Options for {member.username}</div>
                <Button onPress={() => console.log(`Option 1 for ${member.username}`)}>Option 1</Button>
                <Button onPress={() => console.log(`Option 2 for ${member.username}`)}>Option 2</Button>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        <Card key={'pozvat'} onPress={onOpen} isPressable>
          <CardBody>
            <Flex justify="center">
              <Avatar
                className="justify-item-center"
                key="pozvat"
                size="lg"
                icon={<UsersInvite />}
              />
            </Flex>
            <p className="text-center">Pozvat další</p>
          </CardBody>
        </Card>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
                          <h4 className="text-small font-semibold leading-none text-default-600">{friend.username}</h4>
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
    </div>
  );
};

export default UserBar;