import { Box, Flex, Image, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react';
import { FractalBrandBurger } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import useDAOMetadata from '../../../../hooks/DAO/useDAOMetadata';
import { useFractal } from '../../../../providers/App/AppProvider';
import ExternalLink from '../../../ui/links/ExternalLink';

export default function InfoHeader() {
  const {
    node: { daoName },
  } = useFractal();
  const daoMetadata = useDAOMetadata();
  const { t } = useTranslation();

  if (!daoMetadata) {
    return null;
  }

  return (
    <Flex
      bg={daoMetadata.headerBackground}
      justifyContent="center"
      alignItems="center"
      marginLeft="-3rem"
      marginRight="-3rem"
      width="calc(100% + 6rem)"
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
            <Flex>
              {/* TODO: Replace with regular burger icon once added to @decent-org/fractal-ui */}
              <FractalBrandBurger boxSize="2rem" />
              <Text
                textStyle="text-lg-mono-regular"
                ml={4}
              >
                {daoName}
              </Text>
            </Flex>
          </MenuButton>
          <MenuList
            rounded="lg"
            shadow="menu-gold"
            mr={['auto', '1rem']}
            bg="grayscale.black"
            border="none"
            padding="1rem"
            zIndex={1000}
          >
            <Text
              textStyle="text-sm-sans-regular"
              color="chocolate.200"
              marginBottom="0.5rem"
            >
              {t('goTo')}
            </Text>
            {daoMetadata.links.map(link => (
              <Box key={link.url}>
                <ExternalLink href={link.url}>{link.title}</ExternalLink>
              </Box>
            ))}
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}
