import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Accordion, AccordionItem, Card, CardBody, Input, Autocomplete, AutocompleteItem, AutocompleteSection, Button, Popover, PopoverTrigger, PopoverContent, useDisclosure } from '@nextui-org/react';
import { Flex } from 'antd';

const Trip = () => {
  const { ID_trip } = useParams();
  const [savedItems, setSavedItems] = useState([]);
  const [itemSearchResults, setItemSearchResults] = useState({});
  const [itemSearchTerms, setItemSearchTerms] = useState({});
  const [categorySearchResults, setCategorySearchResults] = useState({});
  const [categorySearchTerms, setCategorySearchTerms] = useState({});
  const [error, setError] = useState('');
  const [isUsingList, setIsUsingList] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchSavedItems = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/saved-items', { params: { userId: id_user } });
      setSavedItems(response.data);
    } catch (error) {
      setError('Chyba při načítání uložených položek');
    }
  };

  const fetchUsingListItems = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/using-list-items', { params: { id_user, id_trip: ID_trip } });
      setSavedItems(response.data);
      setIsUsingList(true);
    } catch (error) {
      setError('Chyba při načítání položek seznamu');
    }
  };

  const checkUsingListCategory = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get('/api/check-using-list-category', { params: { id_user, id_trip: ID_trip } });
      if (response.data.exists) {
        fetchUsingListItems();
      } else {
        fetchSavedItems();
      }
    } catch (error) {
      setError('Chyba při ověřování kategorie seznamu');
    }
  };

  useEffect(() => {
    checkUsingListCategory();
  }, [ID_trip]);

  const handleItemSearchChange = (e, itemId) => {
  };

  const handleItemSelect = (item, itemId) => {
  };

  const handleByDayChange = (e, itemId) => {
  };

  const handleCountChange = (e, itemId) => {
  };

  const handleCategorySearchChange = (e, itemId) => {
  };

  const handleCategorySelect = (category, itemId) => {
  };

  const createList = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.post('/api/create-list', {
        id_user,
        id_trip: ID_trip,
        items: savedItems
      });
      console.log('List created successfully:', response.data);
      fetchUsingListItems(); 
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
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
      {!isUsingList && (
        <Popover placement="right">
          <PopoverTrigger>
            <Button className="fixed bottom-4 right-4 z-50">Vytvořit seznam</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="text-small font-bold">Opravdu chcete vytvořit seznam?</div>
              <Button className='me-3 b' color="success" variant="flat">
                Pokračovat ve vytváření
              </Button>
              <Button color="warning" variant="flat" onClick={createList}>
                Ano
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default Trip;