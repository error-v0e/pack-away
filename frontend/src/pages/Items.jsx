import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Accordion, AccordionItem, useDisclosure, Avatar, Autocomplete, AutocompleteItem, CardHeader, Card, CardBody, CardFooter } from '@nextui-org/react';
import { Flex } from 'antd';

const Items = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchItems = async (search) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/items`, { params: { search } });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async (search) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/search-categories`, { params: { search } });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createCategory = async (name) => {
    try {
      const response = await axios.post(`${config.apiUrl}/api/categories`, { name });
      setCategories([...categories, response.data]);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchItems(searchTerm);
    } else {
      setItems([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (categorySearchTerm) {
      fetchCategories(categorySearchTerm);
    } else {
      setCategories([]);
    }
  }, [categorySearchTerm]);

  const handleItemSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySearchChange = (e) => {
    setCategorySearchTerm(e.target.value);
  };

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
              inputProps={{
                onChange: handleItemSearchChange,
                value: searchTerm
              }}
            >
              {items.map(item => (
                <AutocompleteItem key={item.id_item} textValue={item.name}>
                  {item.name}
                </AutocompleteItem>
              ))}
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
              placeholder="2"
              type="number"
            />
            <Autocomplete
              className="max-w-xs mt-3"
              items={categories}
              label="Vyber kategorie"
              placeholder="Vyhledej kategorii"
              inputProps={{
                onChange: handleCategorySearchChange,
                value: categorySearchTerm
              }}
            >
              {categories.map(category => (
                <AutocompleteItem key={category.id_category} textValue={category.name}>
                  {category.name}
                </AutocompleteItem>
              ))}
              <AutocompleteItem key="create-new" textValue={`Vytvořit kategorii ${categorySearchTerm}`} onClick={() => createCategory(categorySearchTerm)}>
                Vytvořit kategorii {categorySearchTerm}
              </AutocompleteItem>
            </Autocomplete>
            <Button size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]'>
              Přidat položku
            </Button>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default Items;