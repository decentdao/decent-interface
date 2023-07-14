'use client';

import { Box, Flex } from '@chakra-ui/react';
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

  // using this gap method instead of 'gap' to make width percentages more precise, since they
  // can now add up to 100%, as well as prevent variable gap space as you widen the screen
  const PAD = '0.5rem'; // half the intended gap of 1rem
  const NONE = '0rem';

  return (
    <Flex
      flexDirection="column"
      minH="10.5rem"
    >
      <ParentLink />
      <Flex
        flexWrap="wrap"
        justifyContent="space-between"
        mb="1rem"
      >
        <Box
          minWidth={{ base: '100%', md: '100%', lg: '33%', xl: '40%' }}
          pe={{ base: NONE, lg: PAD }}
          pb={{ sm: PAD, lg: NONE }}
        >
          <InfoBox>
            <InfoDAO />
          </InfoBox>
        </Box>
        <Box
          minWidth={{ base: '100%', md: '33.3%', lg: '25%', xl: '20%' }}
          ps={{ base: NONE, lg: PAD }}
          pe={{ base: NONE, md: PAD }}
          pb={{ sm: PAD, md: NONE }}
          pt={{ sm: PAD, lg: NONE }}
        >
          <InfoBox>
            <InfoGovernance />
          </InfoBox>
        </Box>
        <Box
          minWidth={{ base: '100%', md: '33.3%', lg: '19%', xl: '20%' }}
          ps={{ base: NONE, md: PAD }}
          pe={{ base: NONE, md: PAD }}
          pb={{ sm: PAD, md: NONE }}
          pt={{ sm: PAD, lg: NONE }}
        >
          <InfoBox to={DAO_ROUTES.proposals.relative(daoAddress)}>
            <InfoProposals />
          </InfoBox>
        </Box>
        <Box
          minWidth={{ base: '100%', md: '33.3%', lg: '23%', xl: '20%' }}
          ps={{ base: NONE, md: PAD }}
          pt={{ sm: PAD, lg: NONE }}
        >
          <InfoBox to={DAO_ROUTES.treasury.relative(daoAddress)}>
            <InfoTreasury />
          </InfoBox>
        </Box>
      </Flex>
    </Flex>
  );
}
