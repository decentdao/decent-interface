import { Flex, HStack, Modal, ModalContent, ModalOverlay, Spacer, Text } from '@chakra-ui/react';
import { Warning, X } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import {
  BACKGROUND_SEMI_TRANSPARENT,
  MAX_CONTENT_WIDTH,
  SIDEBAR_WIDTH,
} from '../../../constants/common';
import Divider from '../utils/Divider';

export type ModalBaseSize = 'sm' | 'md' | 'lg' | 'xl';
interface ModuleBaseProps {
  isSearchInputModal: boolean;
  title: string;
  warn?: boolean;
  size?: ModalBaseSize;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
}
/**
 * The base wrapper component for a modal.  This displays the Chakra components necessary to open a modal,
 * as well as the title of the modal.  The child component provided is displayed as the modal content.
 */
export function ModalBase({
  zIndex,
  isOpen,
  onClose,
  isSearchInputModal,
  children,
  title,
  warn,
  size = 'lg',
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
        backdropBlur="10px"
        zIndex={zIndex}
      />
      {isSearchInputModal ? (
        <ModalContent
          mx={{ base: '1rem', md: '1.5rem' }}
          mt={{ base: '9.5rem' }}
          pl={{ base: '0', md: SIDEBAR_WIDTH }}
          maxW={`calc(${MAX_CONTENT_WIDTH} + ${SIDEBAR_WIDTH})`}
          zIndex={zIndex ? zIndex + 1 : undefined}
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
          containerProps={
            zIndex
              ? {
                  zIndex: zIndex + 1,
                }
              : undefined
          }
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
              <Divider marginBottom="1rem" />
            </>
          )}
          {children}
        </ModalContent>
      )}
    </Modal>
  );
}
