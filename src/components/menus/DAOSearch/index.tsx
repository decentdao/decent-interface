import { Box, Menu, MenuButton, MenuList } from '@chakra-ui/react';
import { Input, Search } from '@decent-org/fractal-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSearchDao from '../../../hooks/useSearchDao';
import { SearchDisplay } from './SearchDisplay';

export function DAOSearch() {
  const [searchAddressInput, setSearchAddressInput] = useState('');
  const inputRef = useRef<HTMLInputElement>();
  const { t } = useTranslation(['dashboard']);

  const {
    errorMessage,
    loading,
    address,
    resetErrorState,
    addressIsGnosisSafe,
    updateSearchString,
  } = useSearchDao();

  const selectInput = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const unFocusInput = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  useEffect(() => {
    updateSearchString(searchAddressInput);
  }, [updateSearchString, searchAddressInput]);

  useEffect(() => {
    return () => {
      resetErrorState();
    };
  });

  return (
    <Box
      width="full"
      maxW="31.125rem"
      height="full"
    >
      <Menu
        matchWidth
        isLazy
        defaultIsOpen={true}
        onOpen={selectInput}
        onClose={() => {
          setSearchAddressInput('');
          unFocusInput();
        }}
      >
        <MenuButton
          h="full"
          w="full"
          data-testid="header-searchMenuButton"
        >
          <Input
            ref={inputRef}
            leftElement={
              <Search
                boxSize="1.5rem"
                color="grayscale.300"
              />
            }
            placeholder={t('searchDAOPlaceholder')}
            minWidth="full"
            onChange={e => setSearchAddressInput(e.target.value)}
            value={searchAddressInput}
          />
        </MenuButton>
        <MenuList
          onFocus={focusInput}
          border="none"
          rounded="lg"
          shadow="menu-gold"
          bg="grayscale.black"
          hidden={!errorMessage && !address}
        >
          <Box p="0.5rem 1rem">
            <SearchDisplay
              loading={loading}
              errorMessage={errorMessage}
              validAddress={addressIsGnosisSafe}
              address={address}
            />
          </Box>
        </MenuList>
      </Menu>
    </Box>
  );
}
