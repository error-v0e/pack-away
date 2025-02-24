import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardHeader, Avatar, Button, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Flex } from 'antd';
import { SearchIcon } from "../assets/SearchIcon";
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

const Friends = () => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async (searchQuery = '') => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/users`, { params: { id_user, search: searchQuery } }, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login'); 
      } else {
        console.error('Error fetching users:', error);
      }
    }
  };

  const fetchFriends = async () => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      const response = await axios.get(`/api/friends`, { params: { id_user } }, { withCredentials: true });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, [navigate]);

  const debouncedFetchUsers = useCallback(debounce((query) => fetchUsers(query), 300), []);

  const handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    setSearch(searchQuery);
    debouncedFetchUsers(searchQuery);
  };

  const addFollow = async (id_user_two) => {
    try {
      const id_user = JSON.parse(localStorage.getItem('id_user'));
      await axios.post(`/api/add_follow`, { id_user_one: id_user, id_user_two }, { withCredentials: true });
      console.log(`User ${id_user} followed user ${id_user_two}`);
      fetchFriends(); 
      fetchUsers(search); 
    } catch (error) {
      console.error('Error adding follow:', error);
    }
  };

  const removeFollow = async (id_user_two) => {
    const id_user = JSON.parse(localStorage.getItem('id_user'));
    try {
      await axios.delete(`/api/remove_follow`, { data: { id_user_one: id_user, id_user_two } }, { withCredentials: true });
      console.log(`User ${id_user} unfollowed user ${id_user_two}`);
      fetchFriends();
      fetchUsers(search); 
    } catch (error) {
      console.error('Error removing follow:', error);
    }
  };

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Autocomplete
          justify="center"
          classNames={{
            base: "max-w-xs",
            listboxWrapper: "max-h-[320px]",
            selectorButton: "text-default-500"
          }}
          defaultItems={users}
          inputProps={{
            classNames: {
              input: "ml-1",
              inputWrapper: "h-[48px]",
            },
            onChange: handleSearchChange, 
            value: search 
          }}
          listboxProps={{
            hideSelectedIcon: true,
            itemClasses: {
              base: [
                "rounded-medium",
                "text-default-500",
                "transition-opacity",
                "data-[hover=true]:text-foreground",
                "dark:data-[hover=true]:bg-default-50",
                "data-[pressed=true]:opacity-70",
                "data-[hover=true]:bg-default-200",
                "data-[selectable=true]:focus:bg-default-100",
                "data-[focus-visible=true]:ring-default-500",
              ],
            },
          }}
          aria-label="Select an user"
          placeholder="Enter user name"
          popoverProps={{
            offset: 10,
            classNames: {
              base: "rounded-large",
              content: "p-1 border-small border-default-100 bg-background",
            },
          }}
          startContent={<SearchIcon className="text-default-400" strokeWidth={2.5} size={20} />}
          radius="full"
          variant="bordered"
        >
          {(item) => (
            <AutocompleteItem key={item.id_user} textValue={item.username}>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Avatar alt={item.username} className="flex-shrink-0" size="sm" src={item.picture} />
                  <div className="flex flex-col">
                    <span className="text-small">{item.username}</span>
                  </div>
                </div>
                <Button
                  className="border-small mr-0.5 font-medium shadow-small"
                  radius="full"
                  size="sm"
                  variant="bordered"
                  onClick={() => addFollow(item.id_user)}
                >
                  Přidat
                </Button>
              </div>
            </AutocompleteItem>
          )}
        </Autocomplete>
      </Flex>
      <Flex wrap gap="small" justify="center">
        {friends.map(friend => (
          <Card key={friend.id_user} className="max-w-[340px] min-w-[300px]">
            <CardHeader className="justify-between">
              <div className="flex gap-5">
                <Avatar isBordered radius="full" size="md" src={friend.picture} />
                <div className="flex flex-col items-start justify-center mr-3">
                  <h4 className="text-small font-semibold leading-none text-default-600 ">{friend.username}</h4>
                </div>
              </div>
              <Button
                className="bg-transparent text-foreground border-default-200"
                color="primary"
                radius="full"
                size="sm"
                variant="bordered"
                onClick={() => removeFollow(friend.id_user)}
              >
                Odebrat
              </Button>
            </CardHeader>
          </Card>
        ))}
      </Flex>
    </>
  );
};

export default Friends;