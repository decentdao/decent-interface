import { Box, Menu, MenuButton, MenuList } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Input, Search } from '@decent-org/fractal-ui';
import useSearchDao from '../../../hooks/useSearchDao';
import { SearchDisplay } from './SearchDisplay';
import { useTranslation } from 'react-i18next';
interface IDAONavigation {}

export function DAOSearch({}: IDAONavigation) {
  const [searchAddressInput, setSearchAddressInput] = useState('');
  const inputRef = useRef<HTMLInputElement>();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation(['dashboard']);

  const { errorMessage, loading, address, addressNodeType, resetErrorState, updateSearchString } =
    useSearchDao();

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.select();
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
        closeOnSelect={false}
      >
        <MenuButton
          h="full"
          w="full"
          ref={menuButtonRef}
          onClick={focusInput}
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
          border="none"
          rounded="lg"
          shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
          bg="grayscale.black"
        >
          <Box p="0.5rem 1rem">
            <SearchDisplay
              loading={loading}
              errorMessage={errorMessage}
              validAddress={!!addressNodeType}
              address={address}
            />
          </Box>
        </MenuList>
      </Menu>
    </Box>
  );
}
