import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody } from '@nextui-org/react';
import { Flex } from 'antd';

const TripList = ({ ID_trip, tripDays }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [error, setError] = useState('');

  const fetchUsingListItems = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/using-list-items', { params: { IDuser: id_user, IDtrip: ID_trip } });
      setSavedItems(response.data);
      console.log('Using list items:', response.data);
    } catch (error) {
      setError('Chyba při načítání položek seznamu');
    }
  };

  useEffect(() => {
    fetchUsingListItems();
  }, [ID_trip]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Flex wrap justify="center">
        {savedItems.map(category => (
          <Accordion key={category.id_category} className="p-2 w-[300px]" defaultExpandedKeys={[category.id_category.toString()]}>
            <AccordionItem key={category.id_category} aria-label={category.name} title={category.name}>
              {category.items.map(item => (
                <Card key={item.id_item} className="max-w-[400px] mb-2">
                  <CardBody className="justify-between">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{item.name}</h4>
                        <h5 className="text-small tracking-tight text-default-400">{item.by_day ? `Počet (${item.count * tripDays})` : `Počet (${item.count})`}</h5>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
    </div>
  );
};

export default TripList;