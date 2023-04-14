'use client';

import { Box } from '@chakra-ui/react';
import { Settings } from '../../../../src/components/pages/DaoSettings';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';

export default function SettingsPage() {
  return (
    <ClientOnly>
      <Box mt={12}>
        <Settings />
      </Box>
    </ClientOnly>
  );
}
