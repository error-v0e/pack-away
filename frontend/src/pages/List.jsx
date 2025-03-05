import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, DateRangePicker, Accordion, AccordionItem, useDisclosure, Avatar, Autocomplete, AutocompleteItem, CardHeader, Card, CardBody, CardFooter } from "@heroui/react";
import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

const List = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/novy-seznam');
  };

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Button onClick={handleButtonClick} size="lg" className='ps-4 pe-4 min-h-[60px]'>
          Nový seznam
        </Button>
      </Flex>
    </>
  );
}

export default List;