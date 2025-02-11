import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { Flex } from 'antd';
import { Dash } from "../assets/Dash";

const CreateTripList = ({ ID_trip, tripDays, setIsUsingList }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [itemSearchResults, setItemSearchResults] = useState({});
  const [itemSearchTerms, setItemSearchTerms] = useState({});
  const [categorySearchResults, setCategorySearchResults] = useState({});
  const [categorySearchTerms, setCategorySearchTerms] = useState({});
  const [newItem, setNewItem] = useState({ name: '', count: '', by_day: true, category: '' });
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCategoryContextMenu = (e, categoryId) => {
    e.preventDefault();
    setSelectedCategory(categoryId);
    const category = savedItems.find(cat => cat.id_category === categoryId);
    setNewCategoryName(category.name);
    setShowCategoryModal(true);
  };

  const handleCategoryRename = () => {
    // Implement logic to rename category
    setShowCategoryModal(false);
  };

  const handleCategoryDelete = () => {
    // Implement logic to delete category
    setShowCategoryModal(false);
  };

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

  const extractCategoryNames = (savedItems) => {
    return savedItems.map(item => item.name).filter(Boolean);
  };
  

  const fetchCategories = async (searchTerm, itemId) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/search-categories', { params: { search: searchTerm, userId: id_user } }, { withCredentials: true });
      const fetchedCategories = response.data;

      console.log('Fetched categories:', fetchedCategories);

      const usingCategories = {
        savedCategories: Array.from(new Set(extractCategoryNames(savedItems)))
          .map(name => ({ id_category: `saved-${name}`, name }))
      };
      console.log('Using categories:', usingCategories);

      console.log('Saved items:', savedItems);

      const allCategories = [...fetchedCategories.savedCategories, ...fetchedCategories.unsavedCategories, ...usingCategories.savedCategories];

      console.log('All categories:', allCategories);

      const uniqueCategories = allCategories.reduce((acc, category) => {
        if (!acc.some(cat => cat.name === category.name)) {
          acc.push(category);
        }
        return acc;
      }, []);
      

    console.log('Unique categories:', uniqueCategories);
      
    setCategorySearchResults(prevState => ({
      ...prevState,
      [itemId]: {
        savedCategories: uniqueCategories.filter(cat => usingCategories.savedCategories.some(savedCat => savedCat.name === cat.name)),
        unsavedCategories: uniqueCategories.filter(cat => !usingCategories.savedCategories.some(savedCat => savedCat.name === cat.name))
      }
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

      // Update all items to ensure they have the correct category
      setSavedItems(prevState => {
        return prevState.map(cat => ({
          ...cat,
          items: cat.items.map(item => ({
            ...item,
            categoryTerm: prevState.find(c => c.items.some(i => i.id_item === item.id_item))?.name || item.categoryTerm
          }))
        }));
      });
    }
  };

  const removeItem = (itemId) => {
    setSavedItems(prevState => {
      return prevState.map(category => ({
        ...category,
        items: category.items.filter(item => item.id_item !== itemId)
      })).filter(category => category.items.length > 0);
    });
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
      let updatedItems = [...prevState];
      let existingItem = null;
      let existingCategoryIndex = -1;
      let existingItemIndex = -1;
  
      // Find the existing item in any category
      updatedItems.forEach((category, catIndex) => {
        const itemIndex = category.items.findIndex(item => item.name === newItem.name);
        if (itemIndex !== -1) {
          existingItem = category.items[itemIndex];
          existingCategoryIndex = catIndex;
          existingItemIndex = itemIndex;
        }
      });
  
      if (existingItem) {
        // Remove the existing item from its current category
        updatedItems[existingCategoryIndex].items.splice(existingItemIndex, 1);
        if (updatedItems[existingCategoryIndex].items.length === 0) {
          // Remove the category if it has no items left
          updatedItems.splice(existingCategoryIndex, 1);
        }
      }
  
      // Find or create the new category
      const newCategoryIndex = updatedItems.findIndex(cat => cat.name === newItem.category);
      if (newCategoryIndex !== -1) {
        // Add the item to the existing category
        updatedItems[newCategoryIndex].items.push(newItemToAdd);
      } else {
        // Create a new category with the new item
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
          <AccordionItem key={category.id_category} aria-label={category.name} title={
            <div className="flex items-center" onContextMenu={(e) => handleCategoryContextMenu(e, category.id_category)}>
              {category.name}
            </div>
          }>
            {category.items.map(item => (
              <Card key={item.id_item} className="max-w-[400px] mb-2">
                <CardBody>
                  <div className="flex flex-col col-span-6 md:col-span-8">
                    <div className="flex justify-between flex-row-reverse items-start">
                      <Button
                        isIconOnly
                        className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                        radius="full"
                        variant="light"
                        onClick={() => removeItem(item.id_item)}
                      >
                        <Dash />
                      </Button>
                    </div>
                  </div>
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
            {showCategoryModal && selectedCategory === category.id_category && (
              <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
                <ModalContent>
                  <ModalHeader>Přejmenovat nebo smazat kategorii</ModalHeader>
                  <ModalBody>
                    <Autocomplete
                      className="max-w-xs"
                      label="Kategorie"
                      placeholder="Vyhledej kategorii"
                      inputProps={{
                        onChange: (e) => handleCategorySearchChange(e, category.id_category),
                        value: categorySearchTerms[category.id_category] || category.name || ''
                      }}
                    >
                      <AutocompleteSection title="Vaše uložené">
                        {categorySearchResults[category.id_category]?.savedCategories.map(cat => (
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, category.id_category)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                      <AutocompleteSection title="Návrhy">
                        {categorySearchResults[category.id_category]?.unsavedCategories.map(cat => (
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onClick={() => handleCategorySelect(cat, category.id_category)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                    </Autocomplete>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" onClick={handleCategoryDelete}>Smazat</Button>
                    <Button onClick={() => handleCategoryRename(category.name, categorySearchTerms[category.id_category] || category.name)}>Přejmenovat</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}
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