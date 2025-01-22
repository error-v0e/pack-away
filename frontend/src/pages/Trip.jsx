import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Trip = () => {
  const { ID_trip, ID_user } = useParams();
  const [tripDetails, setTripDetails] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('id_user'));
        if (!storedUser || storedUser !== ID_user) {
          setError('Neautorizovaný přístup');
          navigate('/login');
          return;
        }

        const response = await axios.post('/api/check_trip', {
          id_trip: ID_trip,
          id_user: ID_user,
        }, { withCredentials: true });

        if (response.data) {
          setTripDetails(response.data);
        } else {
          setError('Výlet nenalezen nebo nemáte oprávnění k přístupu');
        }
      } catch (error) {
        setError('Chyba při načítání detailů výletu');
      }
    };

    fetchTripDetails();
  }, [ID_trip, ID_user, navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!tripDetails) {
    return <div>Načítání...</div>;
  }

  return (
    <div>
      <h1>Trip Details</h1>
      <p>ID Trip: {tripDetails.id}</p>
      <p>Název: {tripDetails.name}</p>
      {/* Další detaily výletu */}
    </div>
  );
};

export default Trip;