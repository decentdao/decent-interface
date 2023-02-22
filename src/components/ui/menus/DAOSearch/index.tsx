import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { Search } from '@decent-org/fractal-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchDao } from '../../../../hooks/DAO/useSearchDao';
import { SearchDisplay } from './SearchDisplay';

export function DAOSearch() {
  const { t } = useTranslation(['dashboard']);
  const [localInput, setLocalInput] = useState('');
  const { errorMessage, isLoading, address, isSafe, setSearchString } = useSearchDao();
  const { onClose } = useDisclosure(); // popover close function
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    setSearchString(localInput);
  }, [localInput, setSearchString]);

  const resetSearch = () => {
    onClose();
    setLocalInput('');
    setSearchString('');
  };

  useOutsideClick({
    ref: ref,
    handler: () => resetSearch(),
  });

  return (
    <Box
      ref={ref}
      width="full"
      maxW={{ base: 'full', md: '31.125rem' }}
      height="4rem"
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
            <InputLeftElement mt="3">
              <Search
                boxSize="1.5rem"
                color="grayscale.300"
              />
            </InputLeftElement>
            <Input
              size="baseAddonLeft"
              placeholder={t('searchDAOPlaceholder')}
              onChange={e => setLocalInput(e.target.value.trim())}
              value={localInput}
              data-testid="search-input"
            />
          </InputGroup>
        </PopoverTrigger>
        <Box
          marginTop="0.5rem"
          padding="1rem 1rem"
          border="none"
          rounded="lg"
          shadow="menu-gold"
          bg="grayscale.black"
          hidden={!errorMessage && !address}
          position="relative"
          zIndex="modal"
        >
          <SearchDisplay
            loading={isLoading}
            errorMessage={errorMessage}
            validAddress={isSafe}
            address={address}
            onClickView={resetSearch}
          />
        </Box>
      </Popover>
    </Box>
  );
}
