import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, useDisclosure } from '@nextui-org/react';
import { Flex } from 'antd';

const CreateTripList = ({ ID_trip, tripDays, setIsUsingList }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [itemSearchResults, setItemSearchResults] = useState({});
  const [itemSearchTerms, setItemSearchTerms] = useState({});
  const [categorySearchResults, setCategorySearchResults] = useState({});
  const [categorySearchTerms, setCategorySearchTerms] = useState({});
  const [newItem, setNewItem] = useState({ name: '', count: '', by_day: true, category: '' });
  const [error, setError] = useState('');

  const fetchSavedItems = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/saved-items', { params: { userId: id_user } }, { withCredentials: true });
      setSavedItems(response.data);
    } catch (error) {
      setError('Chyba při načítání uložených položek');
    }
  };

  const fetchItems = async (searchTerm, itemId) => {
    try {
      const response = await axios.get('/api/items', { params: { search: searchTerm } }, { withCredentials: true });
      setItemSearchResults(prevState => ({
        ...prevState,
        [itemId]: response.data
      }));
    } catch (error) {
      console.error('Chyba při načítání položek:', error);
    }
  };

  const fetchCategories = async (searchTerm, itemId) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/search-categories', { params: { search: searchTerm, userId: id_user } }, { withCredentials: true });
      setCategorySearchResults(prevState => ({
        ...prevState,
        [itemId]: response.data
      }));
    } catch (error) {
      console.error('Chyba při načítání kategorií:', error);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, [ID_trip]);

  const handleItemSearchChange = (e, itemId) => {
    const value = e.target.value;
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, name: value }));
      fetchItems(value, null);
    } else {
      setItemSearchTerms(prevState => ({
        ...prevState,
        [itemId]: value
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === itemId) {
              return { ...item, name: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
      fetchItems(value, itemId);
    }
  };

  const handleItemSelect = (item, itemId) => {
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, name: item.name }));
    } else {
      setItemSearchTerms(prevState => ({
        ...prevState,
        [itemId]: item.name
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(i => {
            if (i.id_item === itemId) {
              return { ...i, name: item.name };
            }
            return i;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleByDayChange = (e, itemId) => {
    const value = e.target.value === 'true';
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, by_day: value }));
    } else {
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === itemId) {
              return { ...item, by_day: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleCountChange = (e, itemId) => {
    const value = e.target.value;
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, count: value }));
    } else {
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === itemId) {
              return { ...item, count: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
    }
  };

  const handleCategorySearchChange = (e, itemId) => {
    const value = e.target.value;
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, category: value }));
      fetchCategories(value, null);
    } else {
      setCategorySearchTerms(prevState => ({
        ...prevState,
        [itemId]: value
      }));
      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(item => {
            if (item.id_item === itemId) {
              return { ...item, categoryTerm: value };
            }
            return item;
          })
        }));
        return updatedItems;
      });
      fetchCategories(value, itemId);
    }
  };

  const handleCategorySelect = (category, itemId) => {
    if (itemId === null) {
      setNewItem(prevState => ({ ...prevState, category: category.name }));
    } else {
      setCategorySearchTerms(prevState => ({
        ...prevState,
        [itemId]: category.name
      }));
  
      setSavedItems(prevState => {
        let selectedItem = null;
  
        // Odstranění položky ze staré kategorie
        const updatedCategories = prevState
          .map(cat => {
            if (cat.items.some(item => item.id_item === itemId)) {
              selectedItem = cat.items.find(item => item.id_item === itemId);
              return {
                ...cat,
                items: cat.items.filter(item => item.id_item !== itemId)
              };
            }
            return cat;
          })
          .filter(cat => cat.items.length > 0); // Odstraní prázdné kategorie
  
        if (selectedItem) {
          // Najdeme kategorii, pokud už existuje
          let existingCategory = updatedCategories.find(cat => cat.name === category.name);
  
          if (existingCategory) {
            // Přidáme položku do existující kategorie
            existingCategory.items.push({ ...selectedItem, categoryTerm: category.name });
          } else {
            // Pokud kategorie neexistuje, vytvoříme nový akordeon
            updatedCategories.push({
              id_category: Date.now(), // Generujeme unikátní ID pro novou kategorii
              name: category.name,
              items: [{ ...selectedItem, categoryTerm: category.name }]
            });
          }
        }
  
        return updatedCategories;
      });
    }
  };

  const addItem = () => {
    const newItemToAdd = {
      id_item: Date.now(), // Temporary ID for new item
      name: newItem.name,
      count: newItem.count,
      by_day: newItem.by_day,
      categoryTerm: newItem.category
    };

    setSavedItems(prevState => {
      const updatedItems = [...prevState];
      const categoryIndex = updatedItems.findIndex(cat => cat.name === newItem.category);
      if (categoryIndex !== -1) {
        updatedItems[categoryIndex].items.push(newItemToAdd);
      } else {
        updatedItems.push({
          id_category: Date.now(), // Temporary ID for new category
          name: newItem.category,
          items: [newItemToAdd]
        });
      }
      return updatedItems;
    });

    setNewItem({ name: '', count: '', by_day: true, category: '' });
  };

  const createList = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post('/api/create-list', {
        id_user,
        id_trip: ID_trip,
        items: savedItems
      }, { withCredentials: true });
      console.log('List created successfully:', response.data);
      setIsUsingList(true);
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Chyba při vytváření seznamu');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Flex wrap justify="center" className="mb-5">
        <Card className="max-w-[400px]">
          <CardBody>
            <Autocomplete
              className="max-w-xs mb-3"
              items={itemSearchResults[null] || []}
              label="Název položky"
              placeholder="Názvi novou položku"
              inputProps={{
                onChange: (e) => handleItemSearchChange(e, null),
                value: newItem.name || ''
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
                    value={newItem.by_day ? 'true' : 'false'}
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
              value={newItem.count || ''}
            />
            <Autocomplete
              className="max-w-xs mt-3"
              label="Vyber kategorie"
              placeholder="Vyhledej kategorii"
              inputProps={{
                onChange: (e) => handleCategorySearchChange(e, null),
                value: newItem.category || ''
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
            <Button size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]' onClick={addItem}>
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
                    <Flex gap="small">
                      <Autocomplete
                        className="max-w-xs mt-3"
                        label="Vyber kategorie"
                        placeholder="Vyhledej kategorii"
                        inputProps={{
                          onChange: (e) => handleCategorySearchChange(e, item.id_item),
                          value: categorySearchTerms[item.id_item] || item.categoryTerm || category.name || ''
                        }}
                        endContent={
                          <Button isIconOnly className='mt-1' onClick={() => handleCategorySelect({ name: categorySearchTerms[item.id_item] || item.categoryTerm || category.name }, item.id_item)}></Button>
                        }
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
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
      <Popover placement="right">
        <PopoverTrigger>
          <Button className="fixed bottom-4 right-4 z-50">Vytvořit seznam</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">
            <div className="text-small font-bold mb-2">Opravdu chcete vytvořit seznam?</div>
            <Button color="warning" variant="flat" className='w-full' onClick={createList}>
              Ano
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CreateTripList;