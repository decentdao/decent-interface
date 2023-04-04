'use client';

import { Flex, Box, Text, HStack } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { InfoBox } from '../../ui/containers/InfoBox';
import EtherscanLinkAddress from '../../ui/links/EtherscanLinkAddress';

function NoModules({ title }: { title: string }) {
  return <Box mt={2}>No {title} enabled</Box>;
}

function ModuleDisplay({ moduleAddress }: { moduleAddress: string }) {
  return (
    <Box>
      <EtherscanLinkAddress
        address={moduleAddress}
        showCopyButton
      >
        {moduleAddress}
      </EtherscanLinkAddress>
    </Box>
  );
}

export function Settings() {
  const {
    node: { safe },
  } = useFractal();

  if (!safe) {
    return;
  }

  const safeModules = safe.modules || [];
  const safeGuard = safe.guard;

  return (
    <Box>
      <HStack marginBottom="0.5rem">
        <Flex
          flexDirection="column"
          gap="1rem"
        >
          <Text>Modules</Text>
          {safeModules.length === 0 ? (
            <NoModules title={'Modules'} />
          ) : (
            safeModules.map(module => (
              <ModuleDisplay
                key={module}
                moduleAddress={module}
              />
            ))
          )}

          <Text>Guards</Text>
          {safeGuard ? (
            <NoModules title={'Guards'} />
          ) : (
            <ModuleDisplay
              key={safeGuard}
              moduleAddress={safeGuard!}
            />
          )}
        </Flex>
      </HStack>
    </Box>
  );
}
