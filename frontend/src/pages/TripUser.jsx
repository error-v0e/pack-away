import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CreateTripList from "../components/CreateTripList.jsx";
import TripList from "../components/TripList.jsx";

const TripUser = () => {
  const { ID_trip, ID_user } = useParams();
  const [error, setError] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [tripDays, setTripDays] = useState(1);

  const checkUserPresence = async () => {
    try {
      const response = await axios.get('/api/check-user-presence', { params: { id_user: ID_user, id_trip: ID_trip } });
      if (response.data.exists) {
        setIsUser(true);
      } else {
        setIsUser(false);
      }
    } catch (error) {
      setError('Chyba při ověřování kategorie seznamu');
    }
  };

  useEffect(() => {
    checkUserPresence();
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get('/api/trip-details/', { params: { id_trip: ID_trip } });
        setTripDays(response.data.days);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
  }, [ID_trip, ID_user]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {!isUser && (
        <>Uživatl není ve vybrané cestě.</>
      )}
      {isUser && (
        <TripList ID_trip={ID_trip} ID_user={ID_user} tripDays={tripDays} />
      )}
    </div>
  );
};

export default TripUser;