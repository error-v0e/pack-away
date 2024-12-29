import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Button, Input, Accordion, AccordionItem, Autocomplete, AutocompleteItem, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Flex } from 'antd';

const Items = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState('');
  const [byDay, setByDay] = useState(true);
  const [savedItems, setSavedItems] = useState([]);

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

  const fetchSavedItems = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`${config.apiUrl}/api/saved-items`, { params: { userId } });
      console.log('Fetched saved items:', response.data);
      setSavedItems(response.data);
    } catch (error) {
      console.error('Error fetching saved items:', error);
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
      fetchSavedItems(); // Refresh saved items after adding
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

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const handleItemSearchChange = (e, id_item) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySearchChange = (e, id_item) => {
    setCategorySearchTerm(e.target.value);
  };

  const handleCountChange = (e, id_item) => {
    setSavedItems(prevState => {
      const updatedItems = prevState.map(category => ({
        ...category,
        items: category.items.map(item => {
          if (item.id_item === id_item) {
            return { ...item, count: e.target.value };
          }
          return item;
        })
      }));
      return updatedItems;
    });
    setCount(e.target.value);
  };

  const handleByDayChange = (e, id_item) => {
    setSavedItems(prevState => {
      const updatedItems = prevState.map(category => ({
        ...category,
        items: category.items.map(item => {
          if (item.id_item === id_item) {
            return { ...item, by_day: e.target.value === 'true' };
          }
          return item;
        })
      }));
      return updatedItems;
    });
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
                    onChange={(e) => handleByDayChange(e, null)}
                    value={byDay ? 'true' : 'false'}
                  >
                    <option value="true">na den</option>
                    <option value="false">na celou cestu</option>
                  </select>
                </div>
              }
              label="Počet"
              placeholder="Zadejte počet"
              type="number"
              onChange={(e) => handleCountChange(e, null)}
              value={count}
            />
            <Autocomplete
              className="max-w-xs mt-3"
              items={categories}
              label="Vyber/vytvoř kategorii"
              placeholder="Nazev kategorie"
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
      <Flex>
        {savedItems.map(category => (
          <Accordion key={category.id_category} className="p-2 flex flex-col gap-1 w-full max-w-[300px]">
            <AccordionItem key={category.id_category} aria-label={category.name} title={category.name}>
              {category.items.map(item => (
                <Card key={item.id_item} className="max-w-[400px] mb-2">
                  <CardBody>
                    <Autocomplete
                      className="max-w-xs mb-3"
                      items={items}
                      label="Název položky"
                      placeholder="Názvi novou položku"
                      inputProps={{
                        onChange: (e) => handleItemSearchChange(e, item.id_item),
                        value: item.name
                      }}
                    >
                      {items.map(i => (
                        <AutocompleteItem key={i.id_item} textValue={i.name} onClick={() => handleItemSelect(i)}>
                          {i.name}
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
                            onChange={(e) => handleByDayChange(e, item.id_item)}
                            value={item.by_day ? 'true' : 'false'}
                          >
                            <option value="true">na den</option>
                            <option value="false">na celou cestu</option>
                          </select>
                        </div>
                      }
                      label="Počet"
                      placeholder="Zadejte počet"
                      type="number"
                      onChange={(e) => handleCountChange(e, item.id_item)}
                      value={item.count}
                    />
                    <Autocomplete
                      className="max-w-xs mt-3"
                      items={categories}
                      label="Vyber kategorie"
                      placeholder="Vyhledej kategorii"
                      inputProps={{
                        onChange: (e) => handleCategorySearchChange(e, item.id_item),
                        value: category.name
                      }}
                    >
                      {categories.map(cat => (
                        <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat)}>
                          {cat.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </CardBody>
                </Card>
              ))}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
    </>
  );
};

export default Items;