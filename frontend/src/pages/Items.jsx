import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Accordion, AccordionItem, useDisclosure, Avatar, Autocomplete, AutocompleteItem, CardHeader, Card, CardBody, CardFooter } from '@nextui-org/react';
import { Flex } from 'antd';

const Items = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);

  const fetchItems = async (search) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/items`, { params: { search } });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchItems(searchTerm);
    } else {
      setItems([]);
    }
  }, [searchTerm]);

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Card className="max-w-[400px]">
          <CardHeader>
            <h4 className="text-medium font-semibold leading-none text-default-600">Nová položka</h4>
          </CardHeader>
          <CardBody>
            <Autocomplete
                className="max-w-xs mb-3"
                items={items}
                label="Název položky"
                placeholder="Názvi novou položku"
            >
              {(item) => <AutocompleteItem key={item.id_item}>{item.name}</AutocompleteItem>}
            </Autocomplete>
            <Input
                endContent={
                    <div className="flex items-center">
                    <select
                        className="outline-none border-0 bg-transparent text-default-400 text-small text-right"
                        id="count"
                        name="count"
                    >
                        <option>na den</option>
                        <option>na celou cestu</option>
                    </select>
                    </div>
                }
                label="Počet"
                labelPlacement="outside"
                placeholder="2"
                type="number"
            />
            <Button  size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]'>
                Přidat položku
            </Button>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default Items;