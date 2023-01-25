import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
} from '@chakra-ui/react';
import { Search } from '@decent-org/fractal-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchDao } from '../../../../hooks/DAO/useSearchDao';
import { SearchDisplay } from './SearchDisplay';

export function DAOSearch() {
  const { t } = useTranslation(['dashboard']);

  const { errorMessage, isLoading, address, isSafe, setSearchString, searchString } =
    useSearchDao();

  const searchUpdate = useCallback(
    (inputAddress: string) => {
      setSearchString(inputAddress);
    },
    [setSearchString]
  );

  const resetSearch = () => {
    setSearchString('');
  };

  return (
    <Box
      width="full"
      maxW="31.125rem"
      height="full"
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
              onChange={e => searchUpdate(e.target.value.trim())}
              value={searchString}
              data-testid="search-input"
            />
          </InputGroup>
        </PopoverTrigger>
        <Box
          border="none"
          rounded="lg"
          shadow="menu-gold"
          bg="grayscale.black"
          hidden={!errorMessage && !address}
        >
          <Box p="0.5rem 1rem">
            <SearchDisplay
              loading={isLoading}
              errorMessage={errorMessage}
              validAddress={isSafe}
              address={address}
              onClickView={resetSearch}
            />
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
