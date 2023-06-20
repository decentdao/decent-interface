'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

export default function ClientOnly({ children, ...rest }: BoxProps) {
  // State / Props
  const [hasMounted, setHasMounted] = useState(false);

  // Hooks
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render
  if (!hasMounted) return null;

  return <Box {...rest}>{children}</Box>;
}
