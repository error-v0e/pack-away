import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar } from "@heroui/react";
import { Flex } from 'antd';

const UserBar = ({ ID_trip, ID_user }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

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

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Flex justify="center">
        {members.map(member => (
          <Avatar
            key={member.id_user}
            size="lg"
            name={member.username}
            src={member.picture}
            isDisabled={!member.view || !member.joined}
          />
        ))}
      </Flex>
    </div>
  );
};

export default UserBar;