import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarIcon, Card, CardBody } from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

const UserBar = ({ ID_trip, ID_user }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const navigateToUserList = async (IDuser) => {
    navigate(`/cesta/${ID_trip}/${IDuser}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Flex gap='small' justify="center">
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
      </Flex>
    </div>
  );
};

export default UserBar;