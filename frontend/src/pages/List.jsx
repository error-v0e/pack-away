import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardHeader, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tooltip } from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

const List = () => {
  const [lists, setLists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const id_user = JSON.parse(localStorage.getItem('id_user'));
        const response = await axios.get('/api/get-lists', { params: { id_user } });
        setLists(response.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, []);

  const handleButtonClick = () => {
    navigate('/novy-seznam');
  };

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Button onClick={handleButtonClick} size="lg" className='ps-4 pe-4 min-h-[60px]'>
          Nový seznam
        </Button>
        
      </Flex>
      <Flex wrap gap="small" justify="center" className="mb-5">
        {lists.map(list => (
          <Tooltip content={"#"+list.id_list}>
            <Card key={list.id_list} className="max-w-[240px] w-full">
              <CardHeader className="flex gap-3">
                <div className="flex flex-col">
                  <p className="text-xl">{list.name}</p>
                  <p className="text-small text-default-500">Počet položek: {list.itemCount}</p>
                </div>
              </CardHeader>
            </Card>
          </Tooltip>
        ))}
      </Flex>
    </>
  );
}

export default List;