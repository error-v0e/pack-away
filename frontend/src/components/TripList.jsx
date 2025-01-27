import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody, CardHeader, Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Flex } from 'antd';
import { Check } from "../assets/Check";
import { Dash } from "../assets/Dash";

const TripList = ({ ID_trip, tripDays }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleLeftClick = (item) => {
    let newStatus;
    switch (item.status) {
      case 'none':
        newStatus = 'check';
        break;
      case 'check':
        newStatus = 'none';
        break;
      case 'dash':
        newStatus = 'none';
        break;
      default:
        newStatus = 'check';
    }
    updateItemStatus(item.id_item, newStatus);
  };

  const handleRightClick = (e, item) => {
    e.preventDefault();
    setSelectedItem(item);
  };

  const updateItemStatus = (id_item, status) => {
    setSavedItems(prevItems => prevItems.map(category => ({
      ...category,
      items: category.items.map(item => item.id_item === id_item ? { ...item, status } : item)
    })));
  };

  const handleStatusChange = (status) => {
    if (selectedItem) {
      updateItemStatus(selectedItem.id_item, status);
      setSelectedItem(null);
    }
  };

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
                  <CardHeader className="justify-between">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{item.name}</h4>
                        <h5 className="text-small tracking-tight text-default-400">{item.by_day ? `Počet (${item.count * tripDays})` : `Počet (${item.count})`}</h5>
                      </div>
                    </div>
                    <Popover isOpen={selectedItem && selectedItem.id_item === item.id_item} onClose={() => setSelectedItem(null)}>
                      <PopoverTrigger>
                        <Button
                          isIconOnly
                          onClick={() => handleLeftClick(item)}
                          onContextMenu={(e) => handleRightClick(e, item)}
                        >
                          {item.status === 'check' ? <Check /> : item.status === 'dash' ? <Dash /> : null}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col gap-2 py-2">
                          <Button isIconOnly onClick={() => handleStatusChange('check')}><Check /></Button>
                          <Button isIconOnly onClick={() => handleStatusChange('dash')}><Dash /></Button>
                          <Button isIconOnly onClick={() => handleStatusChange('none')}></Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </CardHeader>
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