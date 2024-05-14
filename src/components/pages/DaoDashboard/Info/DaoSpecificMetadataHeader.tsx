import { Box, Flex, Image, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react';
import { ArrowAngleUp, Burger } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DAOMetadata } from '../../../../types';
import ExternalLink from '../../../ui/links/ExternalLink';

export function DaoSpecificMetadataHeader(props: { metadata: DAOMetadata }) {
  const {
    node: { daoName },
  } = useFractal();
  const { t } = useTranslation();

  const { metadata: daoMetadata } = props;

  return (
    <Flex
      bg={daoMetadata.headerBackground}
      justifyContent="center"
      alignItems="center"
      position="absolute"
      left="4.25rem"
      width="calc(100vw - 4.25rem)"
      paddingTop={2}
      paddingBottom={2}
      flexDirection="column"
    >
      <Image
        src={daoMetadata.logo}
        alt={`${daoName} logo`}
        width="60px"
        height="60px"
      />
      <Box marginTop={2}>
        <Menu>
          <MenuButton>
            <Flex alignItems="center">
              <Burger boxSize="1.5rem" />
              <Text ml={4}>{daoName}</Text>
            </Flex>
          </MenuButton>
          <MenuList
            rounded="lg"
            mr={['auto', '1rem']}
            border="none"
            padding="1rem 1.5rem"
            zIndex={1000}
          >
            <Text marginBottom="0.5rem">{t('goTo')}</Text>
            <Flex
              gap={4}
              flexDirection="column"
            >
              {daoMetadata.links.map(link => (
                <Box key={link.url}>
                  <ExternalLink href={link.url}>
                    {link.title}{' '}
                    <ArrowAngleUp
                      boxSize="1.5rem"
                      fill="currentColor"
                    />
                  </ExternalLink>
                </Box>
              ))}
            </Flex>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}
