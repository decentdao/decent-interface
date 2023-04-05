'use client';

import { Flex, Box, Text, HStack } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { ethers } from 'ethers';
import { useTranslation, TFunction } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import EtherscanLinkAddress from '../../ui/links/EtherscanLinkAddress';

function NoModules({ title, t }: { title: string; t: TFunction<'settings'[]> }) {
  return (
    <Box mt={2}>
      <Text color="chocolate.200">{t('noModulesEnabled', { title })}</Text>
    </Box>
  );
}

function ModuleDisplay({ moduleAddress }: { moduleAddress: string }) {
  return (
    <Box>
      <EtherscanLinkAddress
        address={moduleAddress}
        showCopyButton
      >
        <Text
          color="gold.500"
          as="span"
          verticalAlign="sub"
        >
          {moduleAddress}
          <ArrowAngleUp verticalAlign="revert"/>
        </Text>
      </EtherscanLinkAddress>
    </Box>
  );
}

function ModulesContainer({
  addresses,
  title,
  t,
}: {
  addresses: string[];
  title: string;
  t: TFunction<'settings'[]>;
}) {
  return (
    <Box
      maxHeight="fit-content"
      minHeight="6.25rem"
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      mt="12"
      borderRadius="0.5rem"
    >
      <HStack marginBottom="0.5rem">
        <Flex
          flexDirection="column"
          gap="1rem"
        >
          <Text textStyle="text-lg-mono-medium">{title}</Text>
          {addresses.length === 0 ? (
            <NoModules
              title={title}
              t={t}
            />
          ) : (
            addresses.map(address => (
              <ModuleDisplay
                key={address}
                moduleAddress={address}
              />
            ))
          )}
        </Flex>
      </HStack>
    </Box>
  );
}

// There will only be 0 or 1 guards, but coerce to an array for normalization with modules
function formatSafeGuardAddress(guardAddress: string | undefined): string[] {
  let safeGuardAddresses: string[];

  if (!guardAddress || guardAddress === ethers.constants.AddressZero) {
    safeGuardAddresses = [];
  } else {
    safeGuardAddresses = [guardAddress];
  }

  return safeGuardAddresses;
}

export function Settings() {
  const {
    node: { safe },
  } = useFractal();

  const { t } = useTranslation(['settings']);

  if (!safe) {
    return <></>;
  }

  const safeModuleAddresses = safe.modules || [];
  const safeGuardAddress = formatSafeGuardAddress(safe.guard);

  return (
    <>
      <ModulesContainer
        addresses={safeModuleAddresses}
        title={t('modules')}
        t={t}
      />
      <ModulesContainer
        addresses={safeGuardAddress}
        title={t('guards')}
        t={t}
      />
    </>
  );
}
