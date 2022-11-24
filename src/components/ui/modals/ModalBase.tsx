import { Divider, Flex, Modal, ModalContent, ModalOverlay, Spacer, Text } from '@chakra-ui/react';
import { CloseX } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';

interface ModuleBaseProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
/**
 * The base wrapper component for a modal.  This displays the Chakra components necessary to open a modal,
 * as well as the title of the modal.  The child component provided is displayed as the modal content.
 */
export function ModalBase(props: ModuleBaseProps) {
  return (
    <Modal
      isCentered
      size="xl"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ModalOverlay backgroundColor="black.900-semi-transparent" />
      <ModalContent
        backgroundColor="black.900"
        padding="1.5rem"
        shadow="menu-gold"
      >
        <Flex marginBottom="1rem">
          <Text
            color="grayscale.100"
            textStyle="text-lg-mono-medium"
          >
            {props.title}
          </Text>
          <Spacer />
          <CloseX onClick={props.onClose} />
        </Flex>
        <Divider
          color="chocolate.700"
          marginBottom="1rem"
        />
        {props.children}
      </ModalContent>
    </Modal>
  );
}
