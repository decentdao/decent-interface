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
    setLocalInput(undefined);
    setSearchString(undefined);
  };

  useOutsideClick({
    ref: ref,
    handler: () => resetSearch(),
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
          marginTop="1.25rem"
          padding="1rem 1rem"
          rounded="0.5rem"
          bg="neutral-3"
          boxShadow="0px 1px 0px 0px var(--chakra-colors-neutral-1)"
          border="1px solid"
          borderColor={!!errorMessage ? 'red-1' : 'neutral-3'}
          position="absolute"
          hidden={!errorMessage && !address}
          zIndex="modal"
          w="full"
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
