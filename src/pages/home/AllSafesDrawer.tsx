import {
  Box,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
} from '@chakra-ui/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { CacheKeys } from '../../hooks/utils/cache/cacheDefaults';
import { getValue } from '../../hooks/utils/cache/useLocalStorage';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeDisplayRow } from './SafeDisplayRow';

interface AllSafesDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function AllSafesDrawer({ isOpen, onClose }: AllSafesDrawerProps) {
  const { addressPrefix } = useNetworkConfig();

  const { t } = useTranslation('home');
  const [drawerHeight, setDrawerHeight] = useState('50%');
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = startHeight.current + (startY.current - e.clientY);
    setDrawerHeight(`${Math.max(100, newHeight)}px`);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = drawerContentRef.current?.clientHeight || 0;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const newHeight = startHeight.current + (startY.current - e.touches[0].clientY);
    setDrawerHeight(`${Math.max(100, newHeight)}px`);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = drawerContentRef.current?.clientHeight || 0;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleScroll = useCallback(() => {
    if (!isDragging) {
      setDrawerHeight('100%');
    }
  }, [isDragging]);

  useEffect(() => {
    const currentDrawerRef = drawerContentRef.current;
    if (currentDrawerRef) {
      currentDrawerRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentDrawerRef) {
        currentDrawerRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isDragging, handleScroll]);

  return (
    <Drawer
      isOpen={isOpen}
      placement="bottom"
      onClose={() => {
        setDrawerHeight('50%');
        onClose();
      }}
      size="md"
    >
      <DrawerOverlay
        bg={BACKGROUND_SEMI_TRANSPARENT}
        backdropFilter="auto"
        backdropBlur="10px"
      />
      <DrawerContent
        ref={drawerContentRef}
        id="drawer-content"
        bg="neutral-2"
        borderTopRadius="0.5rem"
        height={drawerHeight}
        transitionDuration="300ms"
        transitionProperty="all"
        transitionTimingFunction="ease-out"
      >
        <DrawerHeader
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <Box>
            <Box
              mx="calc(50% - 16px)"
              mb="1rem"
              width="32px"
              h="5px"
              bg="white-alpha-16"
              borderRadius="625rem"
              cursor="row-resize"
            />
            <Text
              color="neutral-7"
              textStyle="button-small"
            >
              {t('mySafes')}
            </Text>
          </Box>
        </DrawerHeader>
        <DrawerBody padding="0">
          {getValue({ cacheName: CacheKeys.FAVORITES }).map((favorite: string) => (
            <SafeDisplayRow
              key={favorite}
              network={addressPrefix}
              address={favorite}
            />
          ))}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
