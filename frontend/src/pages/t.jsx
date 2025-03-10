import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, AccordionItem, Card, CardHeader, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Flex } from 'antd';
import { Dash } from "../assets/Dash";

const EditList = () => {
  const { ID_list } = useParams();
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
  const [listName, setListName] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListName = async () => {
      try {
        const response = await axios.get('/api/get-list-name', { params: { listId: ID_list } });
        setListName(response.data.name);
      } catch (error) {
        console.error('Error fetching list name:', error);
        setError('Error fetching list name');
      }
    };

    fetchListName();
    fetchSavedItems();
  }, [ID_list]);

  const handleCategoryContextMenu = (e, categoryId) => {
    e.preventDefault();
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
    const category = savedItems.find(cat => cat.id_category === categoryId);
    console.log('Selected category:', category);
    setNewCategoryName(category.name);
    console.log('N Selected category:', newCategoryName);
    setShowCategoryModal(true);
    console.log(savedItems);
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
      const response = await axios.get('/api/saved-list-items', { params: { userId: id_user, listId: ID_list } }, { withCredentials: true });
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
      console.error('Error fetching item details:', error);
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
      console.error('Error fetching item details:', error);
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

  const createList = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post('/api/create-save-list', {
        id_user: id_user,
        items: savedItems,
        listName: listName 
      }, { withCredentials: true });
      navigate('/seznamy');
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
        <Card className="max-w-[340px] w-full">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-xl">Název seznamu</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
              <Input label="Nazev" type="text" value={listName} onChange={(e) => setListName(e.target.value)} />
            </div>
          </CardBody>
        </Card>
      </Flex>
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
                      {itemSearchResults[null]?.savedItems// filepath: d:\pack-away\frontend\src\pages\EditList.jsx
