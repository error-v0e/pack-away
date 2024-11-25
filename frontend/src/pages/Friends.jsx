import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, Avatar, Button, Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { Flex } from 'antd';
import { SearchIcon } from "../assets/SearchIcon";
import { useNavigate } from 'react-router-dom';

const Friends = () => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login'); // Redirect to login if unauthorized
        } else {
          console.error('Error fetching users:', error);
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <>
      <Autocomplete
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
        aria-label="Select an employee"
        placeholder="Enter employee name"
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
                  <span className="text-tiny text-default-400">{item.email}</span>
                </div>
              </div>
              <Button
                className="border-small mr-0.5 font-medium shadow-small"
                radius="full"
                size="sm"
                variant="bordered"
              >
                Add
              </Button>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
      <Flex wrap gap="small" justify="center">
        <Card className="max-w-[340px]">
          <CardHeader className="justify-between">
            <div className="flex gap-5">
              <Avatar isBordered radius="full" size="md" src="https://nextui.org/avatars/avatar-1.png" />
              <div className="flex flex-col items-start justify-center mr-3">
                <h4 className="text-small font-semibold leading-none text-default-600 ">Zoey Lang</h4>
              </div>
            </div>
            <Button
              className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
              color="primary"
              radius="full"
              size="sm"
              variant={isFollowed ? "bordered" : "solid"}
              onPress={() => setIsFollowed(!isFollowed)}
            >
              {isFollowed ? "Unfollow" : "Follow"}
            </Button>
          </CardHeader>
        </Card>
      </Flex>
    </>
  );
};

export default Friends;