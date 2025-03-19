import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody, CardHeader, Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { Flex } from 'antd';
import { Check } from "../assets/Check.jsx";
import { Dash } from "../assets/Dash.jsx";
import UserBar from "../components/UserBar.jsx";

const ViewTripList = ({ ID_trip, ID_user, tripDays }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [error, setError] = useState('');

  const fetchUsingListItems = async () => {
    try {
        const id_user = JSON.parse(localStorage.getItem('id_user'));
        const response = await axios.get('/api/view-using-list-items', { params: { asking_IDuser: id_user, IDuser: ID_user, IDtrip: ID_trip } });
        setSavedItems(response.data);
      
    } catch (error) {
      setError('Chyba při načítání položek seznamu');
    }
  };
  useEffect(() => {
    fetchUsingListItems();
    const interval = setInterval(fetchUsingListItems, 500); 
    return () => clearInterval(interval); 
  }, [ID_user]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <UserBar ID_trip={ID_trip} ID_user={JSON.parse(localStorage.getItem('id_user'))} />
      <Flex wrap justify="center">
        {savedItems.map(category => (
          <Accordion key={category.id_category} className="p-2 w-[300px]" defaultExpandedKeys={[category.id_category.toString()]}>
            <AccordionItem key={category.id_category} aria-label={category.name} title={category.name}>
              {category.items.map(item => {
                item.status = item.check ? 'check' : item.dissent ? 'dash' : 'none';
                return (
                  <Card key={item.id_item} className="max-w-[400px] mb-2">
                    <CardHeader className="justify-between">
                      <div className="flex gap-5">
                        <div className="flex flex-col gap-1 items-start justify-center">
                          <h4 className="text-small font-semibold leading-none text-default-600">{item.name}</h4>
                          <h5 className="text-small tracking-tight text-default-400">{item.by_day ? `Počet (${item.count * tripDays})` : `Počet (${item.count})`}</h5>
                        </div>
                      </div>
                          <Button
                            isDisabled
                            isIconOnly
                            id='keep-open-element'
                          >
                            {item.status === 'check' ? <Check /> : item.status === 'dash' ? <Dash /> : null}
                          </Button>
                    </CardHeader>
                  </Card>
                );
              })}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
    </div>
  );
};

export default ViewTripList;