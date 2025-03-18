import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, AccordionItem, Card, CardBody, Input, Autocomplete, AutocompleteItem, CardHeader, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Flex } from 'antd';
import { Check } from "../assets/Check.jsx";
import { Dash } from "../assets/Dash.jsx";

const EditTripList = () => {
  const { ID_trip } = useParams();
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
  const navigate = useNavigate();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [lists, setLists] = useState([]);
  const [tripDays, setTripDays] = useState(1);

  const handleCategoryContextMenu = (e, categoryId) => {
    e.preventDefault();
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
    const category = savedItems.find(cat => cat.id_category === categoryId);
    setNewCategoryName(category?.name || '');
    setShowCategoryModal(true);
  };

  const handleCategoryRename = (categoryId, newCategoryName) => {
    setSavedItems((prevState) => {
      let targetCategory = null;
      let renamedCategoryItems = [];
  
      const updatedCategories = prevState.map((category) => {
        if (category.name === newCategoryName) {
          // Najdeme cílovou kategorii
          targetCategory = category;
          return category; // Necháme kategorii beze změny
        } else if (category.id_category === categoryId) {
          // Uchováme položky kategorie, která se přejmenovává
          renamedCategoryItems = [...category.items];
          return null; // Dočasně odstraníme starou kategorii
        } else {
          return category; // Ostatní kategorie zůstanou beze změny
        }
      }).filter(Boolean); // Odstraníme `null` kategorie
  
      // Přesuneme položky do cílové kategorie nebo vytvoříme novou
      if (targetCategory) {
        targetCategory.items = [...targetCategory.items, ...renamedCategoryItems];
      } else {
        updatedCategories.push({
          id_category: categoryId,
          name: newCategoryName,
          items: renamedCategoryItems,
        });
      }
  
      return updatedCategories;
    });
  
    setShowCategoryModal(false); // Zavře modální okno
  };
  

  const handleCategoryDelete = (categoryId) => {
    setSavedItems(prevState => {
      return prevState.filter(category => category.id_category !== categoryId);
    });
    setShowCategoryModal(false);
  };

  const fetchSavedItems = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/using-list-items', { params: { asking_IDuser: id_user, IDuser: id_user, IDtrip: ID_trip } });
      setSavedItems(response.data);
    } catch (error) {
      setError('Chyba při načítání uložených položek');
    }
  };

  const fetchItems = async (searchTerm, itemId) => {
    try {
      console.log(searchTerm);
      const response = await axios.get('/api/items-l', { params: { search: searchTerm } }, { withCredentials: true });
      console.log(response.data);
    const savedItems = response.data.savedItems;
    const unsavedItems = response.data.unsavedItems;
    setItemSearchResults(prevState => ({
      ...prevState,
      [itemId]: { savedItems, unsavedItems }
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

      const usingCategories = {
        savedCategories: Array.from(new Set(extractCategoryNames(savedItems)))
          .map(name => ({ id_category: `saved-${name}`, name }))
      };

      const allCategories = [...fetchedCategories.savedCategories, ...fetchedCategories.unsavedCategories, ...usingCategories.savedCategories];

      const uniqueCategories = allCategories.reduce((acc, category) => {
        if (!acc.some(cat => cat.name === category.name)) {
          acc.push(category);
        }
        return acc;
      }, []);
      
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
    fetchLists();
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get('/api/trip-details/', { params: { id_trip: ID_trip } });
        setTripDays(response.data.days);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
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

  const handleItemSelect = async (item, itemId) => {
  const id_user = JSON.parse(localStorage.getItem('id_user'));

  if (itemId === null) {
    try {
      console.log(item.id_item);
      const response = await axios.get('/api/item-details', { params: { id_item: item.id_item, id_user } }, { withCredentials: true });
      const { name, count, by_day, category } = response.data;

      console.log(response.data);
      setNewItem({
        name: name,
        count: count,
        by_day: by_day,
        category: category
      });
    } catch (error) {
      try {
        console.log(item.id_item);
        const response = await axios.get('/api/item-name', { params: { id_item: item.id_item, id_user } }, { withCredentials: true });
        const { name } = response.data;
  
        console.log(response.data);
        setNewItem({
          name: name
        });
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    }
  } else {
    setItemSearchTerms(prevState => ({
      ...prevState,
      [itemId]: item.name
    }));

    try {
      const response = await axios.get('/api/item-details', { params: { id_item: item.id_item, id_user } }, { withCredentials: true });
      const { name, count, by_day } = response.data;

      setSavedItems(prevState => {
        const updatedItems = prevState.map(category => ({
          ...category,
          items: category.items.map(i => {
            if (i.id_item === itemId) {
              return {
                ...i,
                name,
                count,
                by_day
              };
            }
            return i;
          })
        }));
        return updatedItems;
      });
    } catch (error) {
      try {
        const response = await axios.get('/api/item-name', { params: { id_item: item.id_item} }, { withCredentials: true });
        const { name } = response.data;
  
        setSavedItems(prevState => {
          const updatedItems = prevState.map(category => ({
            ...category,
            items: category.items.map(i => {
              if (i.id_item === itemId) {
                return {
                  ...i,
                  name,
                };
              }
              return i;
            })
          }));
          return updatedItems;
        });
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    }
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
  const handleCategorySearchSelect = (category, categoryId) => {
    setCategorySearchTerms((prevState) => ({
      ...prevState,
      [categoryId]: category.name, // Naplní název kategorie do vstupu (inputu) v modálu
    }));
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
  const fetchLists = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/get-lists', { params: { id_user } });
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };
  const clearAllItems = () => {
    setSavedItems([]);
  };
  const fetchSavedListItems = async (ID_list) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/saved-list-items', { params: { userId: id_user, listId: ID_list } }, { withCredentials: true });
      setSavedItems([]);
      setSavedItems(response.data);
    } catch (error) {
      console.error('Chyba při načítání uložených položek:', error);
    }
  };

  const updateList = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post('/api/update-list', {
        id_user,
        id_trip: ID_trip,
        items: savedItems
      }, { withCredentials: true });
      navigate('/cesta/'+ ID_trip);
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
      <div className="flex justify-between items-center mb-5">
        <Button onPress={() => navigate('/cesta/'+ ID_trip)} className="float-left mb-2 me-5">
          Zpět na cesty      
        </Button>
        <div>
        
      <Modal isOpen={isOpen} size='2xl' onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Vyber seznam
              <div className="text-small">Již načtené položky budou přepsané</div></ModalHeader>
              <ModalBody>
                <Flex wrap gap="small" justify="center" className="mb-6">
                  {lists.map(list => (
                  <Popover key={list.id_list + 'P'} placement="bottom">
                    <PopoverTrigger>
                      <Card key={list.id_list} className="max-w-[280px] m-1 w-full" isPressable>
                        <CardHeader className="flex gap-3">
                          <div className="flex flex-col items-start items-start">
                            <p className="text-xl">{list.name}</p>
                            <p className="text-small text-default-500">Počet položek: {list.itemCount}</p>
                          </div>
                        </CardHeader>
                      </Card>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="px-1 py-2">
                        <div className="text-small font-bold">Načíst seznam "{list.name}"</div>
                        <Button className='me-3 b' variant="flat">
                        Zrusit
                        </Button>
                        <Button color="primary" variant="flat" onPress={() =>{ fetchSavedListItems(list.id_list); onClose();}}>
                        Ano
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  ))}
                </Flex>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
        <Popover>
          <PopoverTrigger>
            <Button className='ms-5 mb-2 float-right'>Odebrat všechny položky</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="text-small font-bold pb-1">Opravdu chcete odebrat<br></br> všechny položky?</div>
              <Button color='danger' onPress={clearAllItems}>Ano</Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button onPress={onOpen} className="float-right">Načíst ze seznamu</Button>
        </div>
      </div>
      <Flex wrap justify="center" className="mb-5">
              <Card className="max-w-[400px]">
                <CardBody>
                  <Autocomplete
                    className="max-w-xs mb-3"
                    label="Název položky"
                    placeholder="Názvi novou položku"
                    inputProps={{
                      onChange: (e) => handleItemSearchChange(e, null),
                      value: newItem.name || ''
                    }}
                    onSelectionChange={(key) => {
                      const selectedItem = itemSearchResults[null]?.savedItems.concat(itemSearchResults[null]?.unsavedItems).find(item => item.id_item === key);
                      if (selectedItem) handleItemSelect(selectedItem, null);
                    }}
                  >
                    <AutocompleteSection title="Vaše uložené">
                      {itemSearchResults[null]?.savedItems.map(item => (
                        <AutocompleteItem key={item.Item.id_item} textValue={item.Item.name} onPress={() => handleItemSelect(item, null)}>
                          {item.Item.name}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                    <AutocompleteSection title="Návrhy">
                      {itemSearchResults[null]?.unsavedItems.map(item => (
                        <AutocompleteItem key={item.id_item} textValue={item.name} onPress={() => handleItemSelect(item, null)}>
                          {item.name}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
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
                        <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySelect(cat, null)}>
                          {cat.name}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                    <AutocompleteSection title="Návrhy">
                      {categorySearchResults[null]?.unsavedCategories.map(cat => (
                        <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySelect(cat, null)}>
                          {cat.name}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteSection>
                  </Autocomplete>
                  <Button size="lg" className='ps-4 pe-4 mt-4 min-h-[40px]' onPress={addItem}>
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
            {category.items.map(item => {
              item.status = item.check ? 'check' : item.dissent ? 'dash' : 'none';
              return (item.check || item.dissent) ? (
                <Card key={item.id_item} className="max-w-[400px] mb-2">
                  <CardHeader className="justify-between">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">{item.name}</h4>
                        <h5 className="text-small tracking-tight text-default-400">{item.by_day ? `Počet (${item.count * tripDays})` : `Počet (${item.count})`}</h5>
                      </div>
                    </div>
                    <Button
                      isDisabled
                      isIconOnly
                      id='keep-open-element'
                    >
                      {item.status === 'check' ? <Check /> : item.status === 'dash' ? <Dash /> : null}
                    </Button>
                  </CardHeader>
                </Card>
              ) : (
                <Card key={item.id_item} className="max-w-[400px] mb-2">
                  <CardBody>
                    <div className="flex flex-col col-span-6 md:col-span-8">
                      <div className="flex justify-between flex-row-reverse items-start">
                        <Button
                          isIconOnly
                          className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                          radius="full"
                          variant="light"
                          onPress={() => removeItem(item.id_item)}
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
                      <AutocompleteSection title="Vaše uložené">
                        {itemSearchResults[item.id_item]?.savedItems.map(i => (
                          <AutocompleteItem key={i.id_item} textValue={i.Item.name} onPress={() => handleItemSelect(i, item.id_item)}>
                            {i.Item.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                      <AutocompleteSection title="Návrhy">
                        {itemSearchResults[item.id_item]?.unsavedItems.map(i => (
                          <AutocompleteItem key={i.id_item} textValue={i.name} onPress={() => handleItemSelect(i, item.id_item)}>
                            {i.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
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
                          <Button isIconOnly className='mt-1' onPress={() => handleCategorySelect({ name: categorySearchTerms[item.id_item] || item.categoryTerm || category.name }, item.id_item)}></Button>
                        }
                      >
                        <AutocompleteSection title="Vaše uložené">
                          {categorySearchResults[item.id_item]?.savedCategories.map(cat => (
                            <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySelect(cat, item.id_item)}>
                              {cat.name}
                            </AutocompleteItem>
                          ))}
                        </AutocompleteSection>
                        <AutocompleteSection title="Návrhy">
                          {categorySearchResults[item.id_item]?.unsavedCategories.map(cat => (
                            <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySelect(cat, item.id_item)}>
                              {cat.name}
                            </AutocompleteItem>
                          ))}
                        </AutocompleteSection>
                      </Autocomplete>
                    </Flex>
                  </CardBody>
                </Card>
              );
            })}
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
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySearchSelect(cat, category.id_category)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                      <AutocompleteSection title="Návrhy">
                        {categorySearchResults[category.id_category]?.unsavedCategories.map(cat => (
                          <AutocompleteItem key={cat.id_category} textValue={cat.name} onPress={() => handleCategorySearchSelect(cat, category.id_category)}>
                            {cat.name}
                          </AutocompleteItem>
                        ))}
                      </AutocompleteSection>
                    </Autocomplete>
                  </ModalBody>
                  <ModalFooter>
                  <Button color="danger" onPress={() => handleCategoryDelete(category.id_category)}>Smazat</Button>
                    <Button onPress={() => handleCategoryRename(category.id_category, categorySearchTerms[category.id_category] || category.name)}>Přejmenovat</Button>
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
          <Button className="fixed bottom-4 right-4 z-50">Uložit seznam</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">
            <div className="text-small font-bold mb-2">Opravdu chcete uložit seznam?</div>
            <Button color="warning" variant="flat" className='w-full' onPress={updateList}>
              Ano
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EditTripList;