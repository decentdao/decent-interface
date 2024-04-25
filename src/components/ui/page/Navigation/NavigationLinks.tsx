import { Box, Flex } from '@chakra-ui/react';
import {
  House,
  GitFork,
  Scroll,
  Coins,
  SquaresFour,
  Question,
  DiscordLogo,
  BookOpen,
} from '@phosphor-icons/react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { NavigationExternalLink } from './NavigationExternalLink';
import { NavigationLink } from './NavigationLink';

function ExternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Box
      width="full"
      mt={4}
      mb={6}
      maxWidth={{ base: 12, '2xl': '100%' }}
      _hover={{ maxWidth: '100%' }}
      transitionDuration="0.5s"
    >
      <Flex
        alignItems="flex-start"
        direction="column"
        pl={'11px'}
        w="full"
        mb={'px'}
        justifyContent={{ base: 'flex-start' }}
        bg={'neutral-2'}
        borderTopRadius={8}
        borderTopWidth={1}
        borderLeftWidth={1}
        borderRightWidth={1}
        borderTopColor={'neutral-3'}
        borderLeftColor={'neutral-3'}
        borderRightColor={'neutral-3'}
        overflow={'hidden'}
      >
        <NavigationExternalLink
          href={URL_FAQ}
          ariaLabelKey="ariaLabelFAQ"
          tooltipKey="faq"
          testId="navigationExternal-faq"
          Icon={<Question size={24} />}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DISCORD}
          ariaLabelKey="ariaLabelDiscord"
          tooltipKey="discord"
          testId="navigationExternal-discord"
          Icon={<DiscordLogo size={24} />}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DOCS}
          ariaLabelKey="ariaLabelDocumentation"
          tooltipKey="documentation"
          testId="navigationExternal-documentation"
          Icon={<BookOpen size={24} />}
          closeDrawer={closeDrawer}
        />
      </Flex>
      <Box
        bg={'neutral-2'}
        borderBottomRadius={8}
        borderWidth={1}
        borderColor={'neutral-3'}
        pt={3}
        pb="5px"
        pl="11px"
        overflow="hidden"
      >
        <LanguageSwitcher data-testid="navigation-language" />
      </Box>
    </Box>
  );
}

export function NavigationLinks({
  address,
  showDAOLinks,
  closeDrawer,
}: {
  showDAOLinks: boolean;
  address: string | null;
  closeDrawer?: () => void;
}) {
  const { addressPrefix } = useNetworkConfig();

  return (
    <Box width={'full'}>
      {showDAOLinks && address && (
        <Box
          width="full"
          height="full"
          marginY="auto"
        >
          <Flex
            alignItems={{ base: 'flex-start', md: 'center' }}
            direction="column"
            w="full"
            mt={8}
            mb={4}
            bg={'neutral-2'}
            borderRadius={8}
            borderWidth={1}
            borderColor={'neutral-3'}
          >
            <NavigationLink
              href={DAO_ROUTES.dao.relative(addressPrefix, address)}
              labelKey="home"
              testId="navigation-daoHomeLink"
              Icon={<House size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.hierarchy.relative(addressPrefix, address)}
              labelKey="nodes"
              testId="navigation-hierarchy"
              Icon={<GitFork size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposals.relative(addressPrefix, address)}
              labelKey="proposals"
              testId="navigation-proposalsLink"
              Icon={<Scroll size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.treasury.relative(addressPrefix, address)}
              labelKey="treasury"
              testId="navigation-treasuryLink"
              Icon={<Coins size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposalTemplates.relative(addressPrefix, address)}
              labelKey="proposalTemplates"
              testId="navigation-proposalTemplatesLink"
              Icon={<SquaresFour size={24} />}
              closeDrawer={closeDrawer}
            />
          </Flex>
        </Box>
      )}
      <ExternalLinks closeDrawer={closeDrawer} />
    </Box>
  );
}
