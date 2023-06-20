'use client';

import { Settings } from '../../../../src/components/pages/DaoSettings';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';

export default function SettingsPage() {
  return (
    <ClientOnly mt={12}>
      <Settings />
    </ClientOnly>
  );
}
