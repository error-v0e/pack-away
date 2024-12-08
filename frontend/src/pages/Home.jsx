import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, DateRangePicker, Accordion, AccordionItem, useDisclosure, Avatar, Autocomplete, AutocompleteItem, CardHeader, Card } from '@nextui-org/react';
import { Flex } from 'antd';
import { PackAwayLogo } from '../assets/PackAwayLogo';
import { MissingInput } from '../assets/MissingInput';
import { Users } from '../assets/Users';

const Home = () => {
  const { isOpen: isNewTripOpen, onOpen: onNewTripOpen, onOpenChange: onNewTripOpenChange } = useDisclosure();
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onOpenChange: onInviteOpenChange } = useDisclosure();
  const [friends, setFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [tripName, setTripName] = useState('');
  const [tripDates, setTripDates] = useState({ start: null, end: null });

  const fetchFriends = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('http://localhost:5000/api/friends', { params: { id_user } });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const inviteFriend = (friend) => {
    setInvitedFriends((prevInvitedFriends) => [...prevInvitedFriends, friend]);
    setFriends((prevFriends) => prevFriends.filter((f) => f.id_user !== friend.id_user));
  };

  const removeInviteFriend = (friend) => {
    setInvitedFriends((prevInvitedFriends) => prevInvitedFriends.filter((f) => f.id_user !== friend.id_user));
    setFriends((prevFriends) => [...prevFriends, friend]);
  };
  
  const createTrip = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post('http://localhost:5000/api/create_trip', {
        id_user,
        name: tripName,
        from_date: tripDates.start ? new Date(tripDates.start).toISOString() : null,
        to_date: tripDates.end ? new Date(tripDates.end).toISOString() : null,
        invitedFriends
      });
      console.log('Trip created successfully:', response.data);
      // Reset state after creating the trip
      setTripName('');
      setTripDates({ start: null, end: null });
      setInvitedFriends([]);
      onNewTripOpenChange(false);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Button onPress={onNewTripOpen} size="lg" className='ps-4 pe-4 min-h-[60px]' startContent={<PackAwayLogo />}>
          Začít novou cestu
        </Button>
        <Modal
          isOpen={isNewTripOpen}
          onOpenChange={onNewTripOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Nová cestu</ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    label="Název cesty"
                    placeholder="Názvi novou cesty"
                    variant="bordered"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                  />
                  <DateRangePicker
                    label="Stay duration"
                    className="w-full"
                    value={tripDates}
                    onChange={(range) => setTripDates({ start: range.start, end: range.end })}
                  />
                  <Button onPress={onInviteOpen} size="lg" className='ps-4 pe-4 min-h-[60px]' startContent={<Users width={50} height={50} />}>
                    Pozvat přátele
                  </Button>
                  <Modal
                    isOpen={isInviteOpen}
                    onOpenChange={onInviteOpenChange}
                    placement="top-center"
                  >
                    <ModalContent>
                      {(onCloseInvite) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">Pozvat přátele</ModalHeader>
                          <ModalBody>
                            <Autocomplete
                              justify="center"
                              classNames={{
                                base: "max-w-xs",
                                listboxWrapper: "max-h-[320px]",
                                selectorButton: "text-default-500"
                              }}
                              defaultItems={friends}
                              inputProps={{
                                classNames: {
                                  input: "ml-1",
                                  inputWrapper: "h-[48px]",
                                },
                              }}
                              listboxProps={{
                                hideSelectedIcon: true,
                                itemClasses: {
                                  base: [
                                    "rounded-medium",
                                    "text-default-500",
                                    "transition-opacity",
                                    "data-[hover=true]:text-foreground",
                                    "dark:data-[hover=true]:bg-default-50",
                                    "data-[pressed=true]:opacity-70",
                                    "data-[hover=true]:bg-default-200",
                                    "data-[selectable=true]:focus:bg-default-100",
                                    "data-[focus-visible=true]:ring-default-500",
                                  ],
                                },
                              }}
                              aria-label="Select a friend"
                              placeholder="Enter friend's name"
                              popoverProps={{
                                offset: 10,
                                classNames: {
                                  base: "rounded-large",
                                  content: "p-1 border-small border-default-100 bg-background",
                                },
                              }}
                              startContent={<Users className="text-default-400" strokeWidth={2.5} size={20} />}
                              radius="full"
                              variant="bordered"
                            >
                              {(item) => (
                                <AutocompleteItem key={item.id_user} textValue={item.username}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                      <Avatar alt={item.username} className="flex-shrink-0" size="sm" src={item.picture} />
                                      <div className="flex flex-col">
                                        <span className="text-small">{item.username}</span>
                                      </div>
                                    </div>
                                    <Button
                                      className="border-small mr-0.5 font-medium shadow-small"
                                      radius="full"
                                      size="sm"
                                      variant="bordered"
                                      onClick={() => inviteFriend(item)}
                                    >
                                      Pozvat
                                    </Button>
                                  </div>
                                </AutocompleteItem>
                              )}
                            </Autocomplete>
                            <div className="mt-4">
                              <h4 className="text-small font-semibold leading-none mb-3 text-default-600">Pozvaní přátelé:</h4>
                              {invitedFriends.map(friend => (
                                <Card key={friend.id_user} className="max-w-[340px] min-w-[300px] mb-3">
                                  <CardHeader className="justify-between">
                                    <div className="flex gap-5">
                                      <Avatar isBordered radius="full" size="md" src={friend.picture} />
                                      <div className="flex flex-col items-start justify-center mr-3">
                                        <h4 className="text-small font-semibold leading-none text-default-600 ">{friend.username}</h4>
                                      </div>
                                    </div>
                                    <Button
                                      className="bg-transparent text-foreground border-default-200"
                                      color="primary"
                                      radius="full"
                                      size="sm"
                                      variant="bordered"
                                      onClick={() => removeInviteFriend(friend)}
                                    >
                                      Odebrat
                                    </Button>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </ModalBody>
                          <ModalFooter>
                            <Button color="primary" onPress={onCloseInvite}>
                              Zavřít
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Zavřít
                  </Button>
                  <Button color="primary" onPress={createTrip}>
                    Vytvořit
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </Flex>
      <Accordion>
      <AccordionItem key="1" aria-label="Pozvanky" title="Pozvanky">
        
      </AccordionItem>
      <AccordionItem key="2" aria-label="Budouci" title="Naschazejici">
        
      </AccordionItem>
      <AccordionItem key="3" aria-label="Aktualni" title="Porbihajici">
        
      </AccordionItem>
      <AccordionItem key="4" aria-label="Minula" title="Minula">
        
      </AccordionItem>
    </Accordion>
      
    </>
  );
};

export default Home;