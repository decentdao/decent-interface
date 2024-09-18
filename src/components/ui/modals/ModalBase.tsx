import { Flex, HStack, Modal, ModalContent, ModalOverlay, Spacer, Text } from '@chakra-ui/react';
import { Warning, X } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import {
  BACKGROUND_SEMI_TRANSPARENT,
  MAX_CONTENT_WIDTH,
  SIDEBAR_WIDTH,
} from '../../../constants/common';
import Divider from '../utils/Divider';

interface ModuleBaseProps {
  isSearchInputModal: boolean;
  title: string;
  warn?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  showTitleDivide?: boolean;
}
/**
 * The base wrapper component for a modal.  This displays the Chakra components necessary to open a modal,
 * as well as the title of the modal.  The child component provided is displayed as the modal content.
 */
export function ModalBase({
  isOpen,
  onClose,
  isSearchInputModal,
  children,
  title,
  warn,
  size = 'lg',
  showTitleDivide = true,
}: ModuleBaseProps) {
  return (
    <Modal
      isCentered
      size={size}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay
        backgroundColor={BACKGROUND_SEMI_TRANSPARENT}
        backdropFilter="auto"
        backdropBlur={'10px'}
      />
      {isSearchInputModal ? (
        <ModalContent
          mx={{ base: '1rem', md: '1.5rem' }}
          mt={{ base: '9.5rem' }}
          pl={{ base: '0', md: SIDEBAR_WIDTH }}
          maxW={`calc(${MAX_CONTENT_WIDTH} + ${SIDEBAR_WIDTH})`}
        >
          {children}
        </ModalContent>
      ) : (
        <ModalContent
          bg="neutral-2"
          borderWidth="1px"
          borderRadius="0.5rem"
          borderColor="neutral-4"
          padding="1.5rem"
        >
          {title && (
            <>
              <Flex
                color="lilac-0"
                marginBottom="1rem"
              >
                <HStack>
                  {warn && <Warning size="20" />}
                  <Text
                    color="white-0"
                    textStyle="display-lg"
                  >
                    {title}
                  </Text>
                </HStack>
                <Spacer />
                <X
                  cursor="pointer"
                  onClick={onClose}
                />
              </Flex>
              {showTitleDivide && <Divider marginBottom="1rem" />}
            </>
          )}
          {children}
        </ModalContent>
      )}
    </Modal>
  );
}
