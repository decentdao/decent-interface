'use client';

import { Flex } from '@chakra-ui/react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { InfoBox } from '../../../ui/containers/InfoBox';
import { InfoDAO } from './InfoDAO';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';
import { ParentLink } from './ParentLink';

export function Info() {
  const {
    node: { daoAddress },
  } = useFractal();
  return (
    <Flex
      flexDirection="column"
      minH="10.5rem"
    >
      <ParentLink />
      <Flex
        flexWrap="wrap"
        gap="1rem"
        justifyContent="space-between"
        mb="1rem"
      >
        <InfoBox minWidth={{ base: '100%', md: '48.75%', lg: '32%', xl: '37%', '2xl': '47%' }}>
          <InfoDAO />
        </InfoBox>
        <InfoBox minWidth={{ base: '100%', md: '48.75%', lg: '13rem', xl: '15rem' }}>
          <InfoGovernance />
        </InfoBox>
        <InfoBox
          to={DAO_ROUTES.proposals.relative(daoAddress)}
          minWidth={{ base: '100%', md: '48.75%', lg: '10rem', xl: '12rem' }}
        >
          <InfoProposals />
        </InfoBox>
        <InfoBox
          to={DAO_ROUTES.treasury.relative(daoAddress)}
          minWidth={{ base: '100%', md: '48.75%', lg: '12rem' }} // 12 rem
        >
          <InfoTreasury />
        </InfoBox>
      </Flex>
    </Flex>
  );
}
