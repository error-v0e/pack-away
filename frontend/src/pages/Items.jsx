import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Button, Input, Accordion, AccordionItem, Autocomplete, AutocompleteItem, AutocompleteSection, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Flex } from 'antd';

const Items = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categories, setCategories] = useState({ savedCategories: [], unsavedCategories: [] });
  const [count, setCount] = useState('');
  const [byDay, setByDay] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [categorySearchResults, setCategorySearchResults] = useState({});
  const [itemSearchTerms, setItemSearchTerms] = useState({});
  const [categorySearchTerms, setCategorySearchTerms] = useState({});
  const [itemSearchResults, setItemSearchResults] = useState({});

  const fetchItems = async (search, id_item = null) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/items`, { params: { search } });
      setItemSearchResults(prevState => ({
        ...prevState,
        [id_item]: response.data
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async (search, id_item = null) => {
    try {
      const userId = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`${config.apiUrl}/api/search-categories`, { params: { search, userId } });
      setCategorySearchResults(prevState => ({
        ...prevState,
        [id_item]: response.data
      }));
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
    fetchSavedItems();
  }, []);

  const handleItemSearchChange = (e, id_item) => {
    const value = e.target.value;
    if (id_item === null) {
      setSearchTerm(value);
      fetchItems(value);
    } else {
      setItemSearchTerms(prevState => ({
        ...prevState,
        [id_item]: value
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === id_item) {
              return { ...item, name: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
      fetchItems(value, id_item);
    }
  };

  const handleCategorySearchChange = (e, id_item) => {
    const value = e.target.value;
    if (id_item === null) {
      setCategorySearchTerm(value);
      fetchCategories(value);
    } else {
      setCategorySearchTerms(prevState => ({
        ...prevState,
        [id_item]: value
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === id_item) {
              return { ...item, categoryTerm: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
      fetchCategories(value, id_item);
    }
  };

  const handleCountChange = (e, id_item) => {
    const value = e.target.value;
    if (id_item === null) {
      setCount(value);
    } else {
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === id_item) {
              return { ...item, count: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleByDayChange = (e, id_item) => {
    const value = e.target.value === 'true';
    if (id_item === null) {
      setByDay(value);
    } else {
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === id_item) {
              return { ...item, by_day: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleItemSelect = (item, id_item) => {
    if (id_item === null) {
      setSearchTerm(item.name);
    } else {
      setItemSearchTerms(prevState => ({
        ...prevState,
        [id_item]: item.name
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(i => {
            if (i.id_item === id_item) {
              return { ...i, name: item.name };
            }
            return i;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleCategorySelect = (category, id_item) => {
    if (id_item === null) {
      setCategorySearchTerm(category.name);
    } else {
      setCategorySearchTerms(prevState => ({
        ...prevState,
        [id_item]: category.name
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
            if (item.id_item === id_item) {
              return { ...item, categoryTerm: category.name };
            }
            return item;
          })
        }));
        return updatedItems;
      });
    }
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
              items={itemSearchResults[null] || []}
              label="Název položky"
              placeholder="Názvi novou položku"
              inputProps={{
                onChange: (e) => handleItemSearchChange(e, null),
                value: searchTerm || ''
              }}
            >
              {itemSearchResults[null]?.map(item => (
                <AutocompleteItem key={item.id_item} textValue={item.name} onClick={() => handleItemSelect(item, null)}>
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
              value={count || ''}
            />
            <Autocomplete
              className="max-w-xs mt-3"
              label="Vyber kategorie"
              placeholder="Vyhledej kategorii"
              inputProps={{
                onChange: (e) => handleCategorySearchChange(e, null),
                value: categorySearchTerm || ''
              }}
              onSelectionChange={(key) => {
                const selectedCategory = categorySearchResults[null]?.savedCategories.concat(categorySearchResults[null]?.unsavedCategories).find(cat => cat.id_category === key);
                if (selectedCategory) handleCategorySelect(selectedCategory, null);
              }}
            >
              <AutocompleteSection title="Vaše uložené">
                {categorySearchResults[null]?.savedCategories.map(cat => (
                  <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, null)}>
                    {cat.name}
                  </AutocompleteItem>
                ))}
              </AutocompleteSection>
              <AutocompleteSection title="Návrhy">
                {categorySearchResults[null]?.unsavedCategories.map(cat => (
                  <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, null)}>
                    {cat.name}
                  </AutocompleteItem>
                ))}
              </AutocompleteSection>
            </Autocomplete>
            <Button size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]' onClick={addItemAndCategory}>
              Přidat položku
            </Button>
          </CardBody>
        </Card>
      </Flex>
      <Flex wrap justify="center">
        {savedItems.map(category => (
          <Accordion key={category.id_category} className="p-2 w-[300px]" defaultExpandedKeys={[category.id_category.toString()]}>
            <AccordionItem key={category.id_category} aria-label={category.name} title={category.name}>
              {category.items.map(item => (
                <Card key={item.id_item} className="max-w-[400px] mb-2">
                  <CardBody>
                    <Autocomplete
                      className="max-w-xs mb-3"
                      items={itemSearchResults[item.id_item] || []}
                      label="Název položky"
                      placeholder="Názvi novou položku"
                      inputProps={{
                        onChange: (e) => handleItemSearchChange(e, item.id_item),
                        value: itemSearchTerms[item.id_item] || item.name || ''
                      }}
                    >
                      {itemSearchResults[item.id_item]?.map(i => (
                        <AutocompleteItem key={i.id_item} textValue={i.name} onClick={() => handleItemSelect(i, item.id_item)}>
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
                      value={item.count || ''}
                    />
                    <Autocomplete
                      className="max-w-xs mt-3"
                      label="Vyber kategorie"
                      placeholder="Vyhledej kategorii"
                      inputProps={{
                        onChange: (e) => handleCategorySearchChange(e, item.id_item),
                        value: categorySearchTerms[item.id_item] || category.name || ''
                      }}
                      onSelectionChange={(key) => {
                        const selectedCategory = categorySearchResults[item.id_item]?.savedCategories.concat(categorySearchResults[item.id_item]?.unsavedCategories).find(cat => cat.id_category === key);
                        if (selectedCategory) handleCategorySelect(selectedCategory, item.id_item);
                      }}
                    >
                      <AutocompleteSection title="Vaše uložené">
                        {categorySearchResults[item.id_item]?.savedCategories.map(cat => (
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, item.id_item)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                      <AutocompleteSection title="Návrhy">
                        {categorySearchResults[item.id_item]?.unsavedCategories.map(cat => (
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, item.id_item)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
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