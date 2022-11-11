import {
  Divider,
  HStack,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import closex from '../assets/images/modal-close.svg';
import { DelegateModal } from './DelegateModal';

const useFractalModal = (title: string, content: ReactNode) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modal = (
    <Modal
      isCentered
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay backgroundColor="#0000008c" />
      <ModalContent
        backgroundColor="black.900"
        padding="1.5rem"
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
        {content}
      </ModalContent>
    </Modal>
  );
  return [modal, onOpen, onClose] as const;
};

export const useDelegateModal = () => {
  let close: Function | undefined;
  const closeWrap = function () {
    if (close) close();
  };
  const delegate = <DelegateModal close={closeWrap} />;
  const { t } = useTranslation('delegate');

  const [modal, onOpen, onClose] = useFractalModal(t('delegateTitle'), delegate);
  close = onClose;
  return [modal, onOpen] as const;
};
