import { Flex, HStack, Modal, ModalContent, ModalOverlay, Spacer, Text } from '@chakra-ui/react';
import { X, Warning } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import {
  BACKGROUND_SEMI_TRANSPARENT,
  SIDEBAR_WIDTH,
  MAX_CONTENT_WIDTH,
} from '../../../constants/common';
import Divider from '../utils/Divider';

interface ModuleBaseProps {
  isSearchInputModal: boolean;
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
      <ModalOverlay
        backgroundColor={BACKGROUND_SEMI_TRANSPARENT}
        backdropFilter="auto"
        backdropBlur={'10px'}
      />
      {props.isSearchInputModal ? (
        <ModalContent
          mx={{ base: '1rem', md: '1.5rem' }}
          mt={{ base: '9.5rem' }}
          pl={{ base: '0', md: SIDEBAR_WIDTH }}
          maxW={`calc(${MAX_CONTENT_WIDTH} + ${SIDEBAR_WIDTH})`}
        >
          {props.children}
        </ModalContent>
      ) : (
        <ModalContent
          bg="neutral-2"
          borderWidth="1px"
          borderRadius="0.5rem"
          borderColor="neutral-4"
          padding="1.5rem"
        >
          {props.title && (
            <>
              <Flex
                color="lilac-0"
                marginBottom="1rem"
              >
                <HStack>
                  {props.warn && <Warning size="20" />}
                  <Text
                    color="white-0"
                    textStyle="display-lg"
                  >
                    {props.title}
                  </Text>
                </HStack>
                <Spacer />
                <X
                  cursor="pointer"
                  onClick={props.onClose}
                />
              </Flex>
              <Divider marginBottom="1rem" />
            </>
          )}
          {props.children}
        </ModalContent>
      )}
    </Modal>
  );
}
