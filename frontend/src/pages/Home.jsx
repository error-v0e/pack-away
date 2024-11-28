import React from 'react';
import { Card, CardHeader, Avatar, Button, Autocomplete, AutocompleteItem, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox, Input, Link } from '@nextui-org/react';
import { Flex } from 'antd';
import {Mountain} from "../assets/Icons/Mountain";
import {Users} from "../assets/Users";
import {TriangleExclamation} from "../assets/TriangleExclamation";
import {PackAwayLogo} from "../assets/PackAwayLogo";

const Home = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  return (
    <> 
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Button onPress={onOpen} size="lg" className='ps-2 pe-3'>
        <div>
          <PackAwayLogo />
        </div>
        <div>
          Začít novou cestu
        </div>
        </Button> 
        <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Nová cestu</ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    label="Email"
                    placeholder="Enter your email"
                    variant="bordered"
                  />
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    variant="bordered"
                  />
                  <div className="flex py-2 px-1 justify-between">
                    <Checkbox
                      classNames={{
                        label: "text-small",
                      }}
                    >
                      Remember me
                    </Checkbox>
                    <Link color="primary" href="#" size="sm">
                      Forgot password?
                    </Link>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Sign in
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </Flex>
    
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Card className="max-w-[340px] px-1 min-w-[240px]">
          <CardBody className="justify-between">
            <div className="flex gap-3">
              <div>
                <Mountain/>
              </div>
              <div className="flex flex-col gap-1 w-full items-start justify-center ">
                <h4 className="text-base font-semibold leading-none text-default-600">Hory</h4>
                <div className="flex justify-between w-[100%] gap-max">
                  <div className="flex gap-1 justify-start">
                    <Users/>
                    <p className="text-small text-foreground/50">4</p>
                  </div>
                  <div className="flex gap-1 justify-start">
                    <TriangleExclamation/>
                    <p className="text-small text-foreground/50">4</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Flex>
    </>
  );
};

export default Home;
