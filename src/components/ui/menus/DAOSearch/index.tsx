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
import debounce from 'lodash.debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from '../../../../assets/theme/custom/icons/Search';
import { SEXY_BOX_SHADOW_T_T } from '../../../../constants/common';
import { useSearchDao } from '../../../../hooks/DAO/useSearchDao';
import { SearchDisplay } from './SearchDisplay';

export function DAOSearch({ closeDrawer }: { closeDrawer?: () => void }) {
  const { t } = useTranslation(['dashboard']);
  const [localInput, setLocalInput] = useState<string>('');
  const [typing, setTyping] = useState<boolean>(false);
  const { errorMessage, isLoading, address, setSearchString } = useSearchDao();

  const { onClose } = useDisclosure(); // popover close function
  const ref = useRef<HTMLInputElement>(null);

  const debouncedInput = useMemo(
    () =>
      debounce((input: string) => {
        setSearchString(input);

        // This avoids a small "results" flicker of old state
        // right before next search kicks off.
        setTimeout(() => {
          setTyping(false);
        }, 50);
      }, 500),
    [setSearchString],
  );

  useEffect(() => {
    debouncedInput(localInput);
    setTyping(true);
  }, [debouncedInput, localInput]);

  useEffect(() => {
    return () => {
      debouncedInput.cancel();
    };
  }, [debouncedInput]);

  const resetSearch = () => {
    onClose();
    setLocalInput('');
  };

  useOutsideClick({
    ref,
    handler: resetSearch,
  });

  const showResults = useMemo(() => {
    if (typing) return false;
    if (isLoading) return true;
    const hasMessage = errorMessage !== undefined || address !== undefined;
    return hasMessage;
  }, [address, errorMessage, typing, isLoading]);

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
            <InputLeftElement ml="0.5rem">
              <Search
                boxSize="1.75rem"
                color="white"
              />
            </InputLeftElement>
            <Input
              size="baseAddonLeft"
              w="full"
              placeholder={t('searchDAOPlaceholder')}
              onChange={e => setLocalInput(e.target.value.trim())}
              value={localInput}
              spellCheck="false"
              autoCapitalize="none"
              isInvalid={!!errorMessage && !typing}
              data-testid="search-input"
              sx={{
                paddingInlineStart: '3rem',
              }}
            />
          </InputGroup>
        </PopoverTrigger>
        <Box
          marginTop="0.25rem"
          rounded="0.5rem"
          bg="neutral-2"
          boxShadow={SEXY_BOX_SHADOW_T_T}
          hidden={!showResults}
          zIndex="modal"
          w="full"
          position="absolute"
        >
          <SearchDisplay
            loading={isLoading}
            errorMessage={errorMessage}
            address={address}
            onClickView={resetSearch}
            closeDrawer={closeDrawer}
          />
        </Box>
      </Popover>
    </Box>
  );
}
