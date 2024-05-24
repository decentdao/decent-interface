import {
  Box,
  Input,
  InputGroup,
  Popover,
  PopoverTrigger,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEXY_BOX_SHADOW_T_T } from '../../../../constants/common';
import { useSearchDao } from '../../../../hooks/DAO/useSearchDao';
import { SearchDisplay } from './SearchDisplay';

export function DAOSearch({ closeDrawer }: { closeDrawer?: () => void }) {
  const { t } = useTranslation(['dashboard']);
  const [localInput, setLocalInput] = useState<string>();
  const { errorMessage, isLoading, address, isSafe, setSearchString } = useSearchDao();
  const { onClose } = useDisclosure(); // popover close function
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    setSearchString(localInput);
  }, [localInput, setSearchString]);

  const resetSearch = () => {
    onClose();
    setLocalInput('');
  };

  useOutsideClick({
    ref,
    handler: resetSearch,
  });

  return (
    <Box
      ref={ref}
      width="full"
      position="relative"
    >
      <Popover
        matchWidth
        isLazy
      >
        <PopoverTrigger data-testid="header-searchMenuButton">
          <InputGroup
            h="full"
            flexDirection="column"
            justifyContent="center"
          >
            <Input
              w="full"
              placeholder={t('searchDAOPlaceholder')}
              onChange={e => setLocalInput(e.target.value.trim())}
              value={localInput}
              spellCheck="false"
              isInvalid={!!errorMessage}
              data-testid="search-input"
            />
          </InputGroup>
        </PopoverTrigger>
        <Box
          marginTop="0.25rem"
          rounded="0.5rem"
          bg="neutral-2"
          boxShadow={SEXY_BOX_SHADOW_T_T}
          hidden={!errorMessage && !address}
          zIndex="modal"
          w="full"
          position="absolute"
        >
          <SearchDisplay
            loading={isLoading}
            errorMessage={errorMessage}
            validAddress={isSafe}
            address={address}
            onClickView={resetSearch}
            closeDrawer={closeDrawer}
          />
        </Box>
      </Popover>
    </Box>
  );
}
