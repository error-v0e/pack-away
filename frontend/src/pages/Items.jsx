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
  const [count, setCount] = useState('');
  const [byDay, setByDay] = useState(true);

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

  const addItemAndCategory = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post(`${config.apiUrl}/api/add-item-category`, {
        itemName: searchTerm,
        categoryName: categorySearchTerm,
        userId,
        count,
        by_day: byDay
      });
      console.log('Item and category added:', response.data);
    } catch (error) {
      console.error('Error adding item and category:', error);
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

  const handleCountChange = (e) => {
    setCount(e.target.value);
  };

  const handleByDayChange = (e) => {
    setByDay(e.target.value === 'true');
  };

  const handleItemSelect = (item) => {
    setSearchTerm(item.name);
  };

  const handleCategorySelect = (category) => {
    setCategorySearchTerm(category.name);
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
                <AutocompleteItem key={item.id_item} textValue={item.name} onClick={() => handleItemSelect(item)}>
                  {item.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Input
              endContent={
                <div className="flex items-center">
                  <select
                    className="outline-none border-0 bg-transparent text-default-400 text-small text-right"
                    id="by_day"
                    name="by_day"
                    onChange={handleByDayChange}
                    value={byDay}
                  >
                    <option value="true">na den</option>
                    <option value="false">na celou cestu</option>
                  </select>
                </div>
              }
              label="Počet"
              placeholder="Zadejte počet"
              type="number"
              onChange={handleCountChange}
              value={count}
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
                <AutocompleteItem key={category.id_category} textValue={category.name} onClick={() => handleCategorySelect(category)}>
                  {category.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Button size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]' onClick={addItemAndCategory}>
              Přidat položku
            </Button>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default Items;