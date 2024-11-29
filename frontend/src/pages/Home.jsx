import React from 'react';
import { Card, CardHeader, Avatar, Button, Autocomplete, AutocompleteItem, DateRangePicker, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox, Input, Link } from '@nextui-org/react';
import { Flex } from 'antd';
import {Mountain} from "../assets/Icons/Mountain";
import {Users} from "../assets/Users";
import {MissingInput} from "../assets/MissingInput";
import {PackAwayLogo} from "../assets/PackAwayLogo";

const Home = () => {
  const { isOpen: isNewTripOpen, onOpen: onNewTripOpen, onOpenChange: onNewTripOpenChange } = useDisclosure();
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onOpenChange: onInviteOpenChange } = useDisclosure();

  return (
    <>
      <Flex wrap gap="small" justify="center" className="mb-5">
        <Button onPress={onNewTripOpen} size="lg" className='ps-4 pe-4 min-h-[60px]' startContent={<PackAwayLogo />}>
          Začít novou cestu
        </Button>
        <Modal
          isOpen={isNewTripOpen}
          onOpenChange={onNewTripOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Nová cestu</ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    label="Název cesty"
                    placeholder="Názvi novou cesty"
                    variant="bordered"
                  />
                  <DateRangePicker
                    label="Stay duration"
                    className="w-full"
                  />
                  <Button onPress={onInviteOpen} size="lg" className='ps-4 pe-4 min-h-[60px]' startContent={<Users width={50} height={50} />}>
                    Pozvat přátele
                  </Button>
                  <Modal
                    isOpen={isInviteOpen}
                    onOpenChange={onInviteOpenChange}
                    placement="top-center"
                  >
                    <ModalContent>
                      {(onCloseInvite) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">Pozvat přátele</ModalHeader>
                          <ModalBody>
                            <Input
                              autoFocus
                              label="Přítel"
                              placeholder="Zadejte jméno přítele"
                              variant="bordered"
                            />
                          </ModalBody>
                          <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onCloseInvite}>
                              Close
                            </Button>
                            <Button color="primary" onPress={onCloseInvite}>
                              Invite
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                  <Flex className="flex gap-3">
                    <Mountain/>
                    <Button onPress={onInviteOpen} size="lg" className='ps-4 pe-4 min-h-[50px] w-full'>
                      Změnit ikonu
                    </Button>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Create
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
                    <MissingInput/>
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
