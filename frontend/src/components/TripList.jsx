import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, AccordionItem, Card, CardBody, CardHeader, Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { Flex } from 'antd';
import { Check } from "../assets/Check";
import { Dash } from "../assets/Dash";
import UserBar from "../components/UserBar.jsx";
import { Arrow } from "../assets/Arrow";

const TripList = ({ ID_trip, ID_user, tripDays }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isSameUser, setIsSameUser] = useState(false);
  const navigate = useNavigate();

  const fetchUsingListItems = async () => {
    try {
      if (!ID_user) {
        const id_user = JSON.parse(localStorage.getItem('id_user'));
        const response = await axios.get('/api/using-list-items', { params: { asking_IDuser: id_user, IDuser: id_user, IDtrip: ID_trip } });
        setSavedItems(response.data);
      }else{
        const id_user = JSON.parse(localStorage.getItem('id_user'));
        const response = await axios.get('/api/using-list-items', { params: { asking_IDuser: id_user, IDuser: ID_user, IDtrip: ID_trip } });
        setSavedItems(response.data);
      }
    } catch (error) {
      setError('Chyba při načítání položek seznamu');
    }
  };
  const handleCloseOnInteractOutside = (element) => {
    if (element.id === "popup") {
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchUsingListItems();
    const id_user = JSON.parse(localStorage.getItem('id_user'));
    if (!ID_user) {
      setIsSameUser(true);  
    }
    const interval = setInterval(fetchUsingListItems, 500); 
    return () => clearInterval(interval); 
  }, [ID_trip]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".popover-content") && isPopoverOpen) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isPopoverOpen]);
  
  const handleLeftClick = async (item) => {
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
    await updateItemStatus(item.id_item, newStatus);
    item.status = newStatus; // Aktualizace stavu položky na frontendu
    setSavedItems([...savedItems]); // ... Aktualizace stavu komponenty
  };

  const handleRightClick = (e, item) => {
    e.preventDefault();
    setSelectedItem(item);
    setIsPopoverOpen(true);
  };

  const updateItemStatus = async (id_item, status) => {
    try {
      await axios.post('/api/update-item-status', { id_item, status });
      setSavedItems(prevItems => prevItems.map(category => ({
        ...category,
        items: category.items.map(item => item.id_item === id_item ? { ...item, status } : item)
      })));
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleStatusChange = async (status) => {
    if (selectedItem) {
      await updateItemStatus(selectedItem.id_item, status);
      setSelectedItem(null);
      setIsPopoverOpen(false);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
      {isSameUser ? (
        <><Button isIconOnly color='none' onPress={() => navigate('/')}>
        <Arrow />       
      </Button>

      <Button onPress={() => navigate('/cesta/'+ID_trip+'/uprava-seznamu')}>
          Upravit seznam
      </Button> </>
      ) : null}
        
      </div>
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
                      <Popover isOpen={isPopoverOpen && selectedItem && selectedItem.id_item === item.id_item}  shouldCloseOnInteractOutside={handleCloseOnInteractOutside}>
                        <PopoverTrigger>
                          <Button
                            isIconOnly
                            id='popup'
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
                );
              })}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
    </div>
  );
};

export default TripList;