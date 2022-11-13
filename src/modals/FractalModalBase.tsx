import {
  Divider,
  HStack,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import closex from '../assets/images/modal-close.svg';

/**
 * The base wrapper component for a modal.  This displays the Chakra components necessary to open a modal,
 * as well as the title of the modal.  The child component provided is displayed as the modal content.
 */
export function FractalModalBase({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      isCentered
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay backgroundColor="black.900-semi-transparent" />
      <ModalContent
        backgroundColor="black.900"
        padding="1.5rem"
        shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
      >
        <HStack marginBottom="1rem">
          <Text
            color="grayscale.100"
            textStyle="text-lg-mono-medium"
          >
            {title}
          </Text>
          <Spacer />
          <Image
            src={closex}
            onClick={onClose}
          />
        </HStack>
        <Divider
          color="chocolate.700"
          marginBottom="1rem"
        />
        {children}
      </ModalContent>
    </Modal>
  );
}
