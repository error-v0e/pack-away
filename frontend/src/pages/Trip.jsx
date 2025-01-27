import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CreateTripList from "../components/CreateTripList.jsx";
import TripList from "../components/TripList.jsx";

const Trip = () => {
  const { ID_trip } = useParams();
  const [error, setError] = useState('');
  const [isUsingList, setIsUsingList] = useState(false);
  const [tripDays, setTripDays] = useState(1);

  const checkUsingListCategory = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/check-using-list-category', { params: { id_user, id_trip: ID_trip } });
      if (response.data.exists) {
        setIsUsingList(true);
      } else {
        setIsUsingList(false);
      }
    } catch (error) {
      setError('Chyba při ověřování kategorie seznamu');
    }
  };

  useEffect(() => {
    checkUsingListCategory();
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get('/api/trip-details/', { params: { id_trip: ID_trip } });
        setTripDays(response.data.days);
        console.log('Trip details:', response.data);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
  }, [ID_trip]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {!isUsingList && (
        <CreateTripList ID_trip={ID_trip} tripDays={tripDays} setIsUsingList={setIsUsingList} />
      )}
      {isUsingList && (
        <TripList ID_trip={ID_trip} tripDays={tripDays} />
      )}
    </div>
  );
};

export default Trip;