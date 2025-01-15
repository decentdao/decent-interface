import { Button, Icon as ChakraIcon } from '@chakra-ui/react';
import { X } from '@phosphor-icons/react';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const MODE_QUERY_PARAMS = {
  DEMO: 'demo_mode',
  DEV: 'dev_mode',
} as const;

export const MODE_VALUES = {
  ON: 'on',
  OFF: 'off',
} as const;

type ModeTypesKeys = keyof typeof MODE_QUERY_PARAMS;
type ModeValueTypes = typeof MODE_VALUES;
type ModeValueTypesKeys = keyof ModeValueTypes;

function getModeStorageKey(modeType: ModeTypesKeys) {
  return `decent_${MODE_QUERY_PARAMS[modeType]}`;
}

export function useInitializeModes() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    (Object.keys(MODE_QUERY_PARAMS) as Array<ModeTypesKeys>).forEach(modeType => {
      const MODE_QUERY_PARAM = MODE_QUERY_PARAMS[modeType];
      const MODE_STORAGE_KEY = getModeStorageKey(modeType);
      const rawValue = searchParams.get(MODE_QUERY_PARAM)?.toLowerCase();

      if (rawValue === MODE_VALUES.ON) {
        localStorage.setItem(MODE_STORAGE_KEY, MODE_VALUES.ON);
      } else if (rawValue === MODE_VALUES.OFF) {
        localStorage.setItem(MODE_STORAGE_KEY, MODE_VALUES.OFF);
      }
    });
  }, [searchParams]);
}

export function getModeStatus(modeType: ModeTypesKeys): boolean {
  try {
    const MODE_STORAGE_KEY = getModeStorageKey(modeType);
    return localStorage.getItem(MODE_STORAGE_KEY) === MODE_VALUES.ON;
  } catch {
    return false;
  }
}

function useToggleMode() {
  const [searchParams] = useSearchParams();

  return useCallback(
    (modeType: ModeTypesKeys, modeValue: ModeValueTypes[ModeValueTypesKeys]) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(MODE_QUERY_PARAMS[modeType], modeValue);
      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    },
    [searchParams],
  );
}

function ModeToggleButton({ modeType }: { modeType: ModeTypesKeys }) {
  const handleToggleMode = useToggleMode();

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => handleToggleMode(modeType, MODE_VALUES.OFF)}
      pr="0.3rem"
    >
      {modeType}
      <ChakraIcon
        as={X}
        boxSize="16px"
        position="relative"
      />
    </Button>
  );
}

export function ModeButtons() {
  const modes = Object.keys(MODE_QUERY_PARAMS) as Array<ModeTypesKeys>;

  return (
    <>
      {modes
        .filter(modeType => getModeStatus(modeType))
        .map(modeType => (
          <ModeToggleButton
            key={modeType}
            modeType={modeType}
          />
        ))}
    </>
  );
}
