import {
  Divider,
  Flex,
  HStack,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { Alert, CloseX } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';

interface ModuleBaseProps {
  title: string;
  warn?: boolean;
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
      size="lg"
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ModalOverlay backgroundColor={BACKGROUND_SEMI_TRANSPARENT} />
      <ModalContent
        backgroundColor="black.900"
        padding="1.5rem"
        shadow="menu-gold"
      >
        <Flex marginBottom="1rem">
          <HStack>
            {props.warn && (
              <Alert
                w="1.25rem"
                h="1.25rem"
              />
            )}
            <Text
              color="grayscale.100"
              textStyle="text-lg-mono-medium"
            >
              {props.title}
            </Text>
          </HStack>
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
