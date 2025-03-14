import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, DateRangePicker, Accordion, AccordionItem, useDisclosure, Avatar, Autocomplete, AutocompleteItem, CardHeader, Card } from "@heroui/react";
import { Flex } from 'antd';
import {I18nProvider} from "@react-aria/i18n";
import { PackAwayLogo } from '../assets/PackAwayLogo';
import { MissingInput } from '../assets/MissingInput';
import { Users } from '../assets/Users';

const Home = () => {
  const navigate = useNavigate();
  const { isOpen: isNewTripOpen, onOpen: onNewTripOpen, onOpenChange: onNewTripOpenChange } = useDisclosure();
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onOpenChange: onInviteOpenChange } = useDisclosure();
  const [friends, setFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [tripName, setTripName] = useState('');
  const [tripDates, setTripDates] = useState({ start: null, end: null });
  const [trips, setTrips] = useState({ upcoming: [], ongoing: [], past: [], invites: [] });
  const [defaultOpenKey, setDefaultOpenKey] = useState(null);
  const [pastTripsCount, setPastTripsCount] = useState(10);
  const [allPastTripsLoaded, setAllPastTripsLoaded] = useState(false);

  const fetchFriends = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/friends`, { params: { id_user } }, { withCredentials: true });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/trips`, { params: { id_user } }, { withCredentials: true });
      setTrips(response.data);

      if (response.data.upcoming.length > 0) {
        setDefaultOpenKey('2');
      } else if (response.data.invites.length > 0) {
        setDefaultOpenKey('1');
      } else if (response.data.ongoing.length > 0) {
        setDefaultOpenKey('3');
      } else if (response.data.past.length > 0) {
        setDefaultOpenKey('4');
      } else {
        setDefaultOpenKey(null);
      }

      setAllPastTripsLoaded(response.data.allPastTripsLoaded);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const loadMorePastTrips = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/more_past_trips`, { params: { id_user, offset: pastTripsCount } }, { withCredentials: true });
      setTrips(prevTrips => ({
        ...prevTrips,
        past: [...prevTrips.past, ...response.data.past]
      }));
      setPastTripsCount(prevCount => prevCount + 10);
      setAllPastTripsLoaded(response.data.allPastTripsLoaded);
    } catch (error) {
      console.error('Error loading more past trips:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchTrips();
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
      const response = await axios.post(`/api/create_trip`, {
        
        id_user,
        name: tripName,
        from_date: tripDates.start ? new Date(tripDates.start).toISOString() : null,
        to_date: tripDates.end ? new Date(tripDates.end).toISOString() : null,
        invitedFriends
      }, { withCredentials: true });
      console.log('Trip created successfully:', response.data);
      setPastTripsCount(10);
      setTripName('');
      setTripDates({ start: null, end: null });
      setInvitedFriends([]);
      onNewTripOpenChange(false);
      fetchTrips(); 
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleJoinTrip = async (tripId) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      await axios.post(`/api/join_trip`, { id_user, id_trip: tripId });
      fetchTrips(); 
    } catch (error) {
      console.error('Error joining trip:', error);
    }
  };

  const handleDeclineTrip = async (tripId) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      await axios.post(`/api/decline_trip`, { id_user, id_trip: tripId }, { withCredentials: true });
      fetchTrips(); 
    } catch (error) {
      console.error('Error declining trip:', error);
    }
  };

  const navigateToTripDetail = async (tripId) => {
    navigate(`/cesta/${tripId}`);
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
                  <I18nProvider locale="cs-CZ-u-ca-czech">
                    <DateRangePicker
                      label="Obdobý cesty"
                      className="w-full"
                      value={tripDates}
                      onChange={(range) => setTripDates({ start: range.start, end: range.end })}
                    />
                  </I18nProvider>
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
                                      onPress={() => inviteFriend(item)}
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
                                      onPress={() => removeInviteFriend(friend)}
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
      {defaultOpenKey ? (
        <Accordion defaultExpandedKeys={[defaultOpenKey]} 
        selectionMode="multiple" >
          {trips.invites.length > 0 && (
            <AccordionItem key="1" aria-label="Pozvanky" title="Pozvanky">
              <Flex wrap gap="small" justify="center">
                {trips.invites.map(trip => (
                  <Card key={trip.id_trip} className="max-w-[340px]">
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <PackAwayLogo />
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h5 className="text-small tracking-tight text-default-400">
                            <span className='text-default-900'>{trip.owner}</span> vás zve na <span className='text-default-900'>{trip.name}</span> od <span className='text-default-900'>{trip.from_date}</span> do <span className='text-default-900'>{trip.to_date}</span>
                          </h5>
                        </div>
                      </div>
                      <div className="flex gap-1 ms-2">
                        <Button isIconOnly onPress={() => handleJoinTrip(trip.id_trip)}>
                          Y
                        </Button>
                        <Button isIconOnly color="danger" variant="flat" onPress={() => handleDeclineTrip(trip.id_trip)}>
                          N
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </Flex>
            </AccordionItem>
          )}
          {trips.upcoming.length > 0 && (
            <AccordionItem key="2" aria-label="Budouci" title="Nadchazejici">
              <Flex wrap gap="small" justify="center">
                {trips.upcoming.map(trip => (
                  <Card key={trip.id_trip} className="max-w-[340px]" onPress={() => navigateToTripDetail(trip.id_trip)} isPressable>
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <PackAwayLogo />
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h4 className="text-small font-semibold leading-none text-default-600">{trip.name}</h4>
                          <Flex gap="100px" justify='space-between'>
                            <Flex gap="small">
                              <Users />
                              {trip.members_count}
                            </Flex>
                            <Flex gap="small">
                              <MissingInput />
                              {trip.missing_items_count}
                            </Flex>
                          </Flex>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </Flex>
            </AccordionItem>
          )}
          {trips.ongoing.length > 0 && (
            <AccordionItem key="3" aria-label="Aktualni" title="Porbihajici">
              <Flex wrap gap="small" justify="center">
                {trips.ongoing.map(trip => (
                  <Card key={trip.id_trip} className="max-w-[340px]" onPress={() => navigateToTripDetail(trip.id_trip)} isPressable>
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <PackAwayLogo />
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h4 className="text-small font-semibold leading-none text-default-600">{trip.name}</h4>
                          <Flex gap="100px" justify='space-between'>
                            <Flex gap="small">
                              <Users />
                              {trip.members_count}
                            </Flex>
                            <Flex gap="small">
                              <MissingInput />
                              {trip.missing_items_count}
                            </Flex>
                          </Flex>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </Flex>
            </AccordionItem>
          )}
          {trips.past.length > 0 && (
            <AccordionItem key="4" aria-label="Minulé" title="Minulé">
              <Flex wrap gap="small" justify="center">
                {trips.past.slice(0, pastTripsCount).map(trip => (
                  <Card key={trip.id_trip} className="max-w-[340px]" onPress={() => navigateToTripDetail(trip.id_trip)} isPressable>
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <PackAwayLogo />
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h4 className="text-small font-semibold leading-none text-default-600">{trip.name}</h4>
                          <Flex gap="100px" justify='space-between'>
                            <Flex gap="small">
                              <Users />
                              {trip.members_count}
                            </Flex>
                            <Flex gap="small">
                              <MissingInput />
                              {trip.missing_items_count}
                            </Flex>
                          </Flex>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </Flex>
              {!allPastTripsLoaded && (
                <div className="text-center mt-4">
                  <Button onPress={loadMorePastTrips}>Načíst další</Button>
                </div>
              )}
            </AccordionItem>
          )}
        </Accordion>
      ) : (
        <div className="text-center mt-5">
          <h4>Prozatím nejste součástí žádné cesty</h4>
        </div>
      )}
    </>
  );
};

export default Home;