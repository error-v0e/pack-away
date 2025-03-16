import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardHeader, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import TripList from "../components/TripList.jsx";
import ViewTripList from "../components/ViewTripList.jsx";
import UserBar from "../components/UserBar.jsx";

const TripUser = () => {
  const { ID_trip, ID_user } = useParams();
  const [error, setError] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [viewUser, setViewUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [tripDays, setTripDays] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserPresence = async () => {
      try {
        const response = await axios.get('/api/check-user-presence', {
          params: { id_user: ID_user, id_trip: ID_trip }
        });
        setIsUser(response.data.exists);
      } catch (error) {
        setError('Chyba při ověřování přítomnosti uživatele');
      }
    };

    const fetchTripDetails = async () => {
      try {
        const response = await axios.get('/api/trip-details/', { params: { id_trip: ID_trip } });
        setTripDays(response.data.days);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };

    checkUserPresence();
    fetchTripDetails();
  }, [ID_trip, ID_user]);

  useEffect(() => {
    if (!isUser) return; // Spustí se jen pokud je uživatel ve výletu

    const fetchUserPermissions = async () => {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      try {
        const response = await axios.get('/api/user-permissions', {
          params: { id_user, id_friend: ID_user, id_trip: ID_trip }
        });
        setViewUser(response.data.view);
        setEditUser(response.data.edit);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setError('Chyba při načítání oprávnění uživatele');
      }
    };

    fetchUserPermissions();
  }, [isUser, ID_trip, ID_user]); // Bude se spouštět pouze pokud se změní isUser

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div>
        <Button onPress={() => navigate('/cesta/'+ID_trip)}>
          Zpět na svůj seznam       
        </Button>
      </div>
      <UserBar ID_trip={ID_trip} ID_user={JSON.parse(localStorage.getItem('id_user'))} />
      {!isUser && <div>Uživatel není ve vybrané cestě.</div>}
      {editUser && <TripList ID_trip={ID_trip} ID_user={ID_user} tripDays={tripDays} />}
      {viewUser && <ViewTripList ID_trip={ID_trip} ID_user={ID_user} tripDays={tripDays} />}
    </div>
  );
};

export default TripUser;
