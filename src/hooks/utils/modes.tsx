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

function getModeStorageKey(modeType: keyof typeof MODE_QUERY_PARAMS) {
  return `decent_${MODE_QUERY_PARAMS[modeType]}`;
}

export function useInitializeModes() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    (Object.keys(MODE_QUERY_PARAMS) as Array<keyof typeof MODE_QUERY_PARAMS>).forEach(modeType => {
      const MODE_QUERY_PARAM = MODE_QUERY_PARAMS[modeType];
      const MODE_STORAGE_KEY = getModeStorageKey(modeType);
      const rawValue = searchParams.get(MODE_QUERY_PARAM)?.toLowerCase();

      if (rawValue === MODE_VALUES.ON) {
        localStorage.setItem(MODE_STORAGE_KEY, 'true');
      } else if (rawValue === MODE_VALUES.OFF) {
        localStorage.setItem(MODE_STORAGE_KEY, 'false');
      }
    });
  }, [searchParams]);
}

export function getModeStatus(modeType: keyof typeof MODE_QUERY_PARAMS): boolean {
  try {
    const MODE_STORAGE_KEY = getModeStorageKey(modeType);
    return localStorage.getItem(MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function useToggleMode() {
  const [searchParams] = useSearchParams();

  return useCallback(
    (
      modeType: keyof typeof MODE_QUERY_PARAMS,
      modeValue: (typeof MODE_VALUES)[keyof typeof MODE_VALUES],
    ) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(MODE_QUERY_PARAMS[modeType], modeValue);
      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    },
    [searchParams],
  );
}

interface ModeToggleButtonProps {
  modeType: keyof typeof MODE_QUERY_PARAMS;
  isActive: boolean;
  onToggle: (
    modeType: keyof typeof MODE_QUERY_PARAMS,
    modeValue: (typeof MODE_VALUES)[keyof typeof MODE_VALUES],
  ) => void;
}

function ModeToggleButton({ modeType, isActive, onToggle }: ModeToggleButtonProps) {
  if (!isActive) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => onToggle(modeType, MODE_VALUES.OFF)}
      pr="0.3rem"
    >
      {modeType.charAt(0) + modeType.slice(1).toLowerCase()}{' '}
      <ChakraIcon
        as={X}
        boxSize="16px"
        position="relative"
        top="1px"
      />
    </Button>
  );
}

export function ModeButtons() {
  const handleToggleMode = useToggleMode();
  const modes = Object.keys(MODE_QUERY_PARAMS) as Array<keyof typeof MODE_QUERY_PARAMS>;

  return (
    <>
      {modes.map(modeType => (
        <ModeToggleButton
          key={modeType}
          modeType={modeType}
          isActive={getModeStatus(modeType)}
          onToggle={handleToggleMode}
        />
      ))}
    </>
  );
}
