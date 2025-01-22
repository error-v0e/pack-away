import React from 'react';
import { useParams } from 'react-router-dom';

const Trip = () => {
  const { ID_trip } = useParams();

  return (
    <div>
      <h1>Trip Details</h1>
      <p>ID Trip: {ID_trip}</p>
    </div>
  );
};

export default Trip;