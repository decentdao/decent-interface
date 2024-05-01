import { Text, BoxProps, Image, HStack, Spacer, Flex, Box, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { StyledBox } from '../../ui/containers/StyledBox';
interface DAOFeatureProps extends BoxProps {
  iconSrc: string;
  title: string;
  desc: string;
  network: string;
  address: string;
}

export default function FeaturedDAOCard({
  iconSrc,
  title,
  desc,
  network,
  address,
  ...rest
}: DAOFeatureProps) {
  const { t } = useTranslation('home');
  return (
    <Box {...rest}>
      <StyledBox
        height="full"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          <HStack paddingBottom="1rem">
            <Image
              width="1.5rem"
              height="1.5rem"
              src={iconSrc}
              alt={title}
            />
            <Text paddingStart="1.25rem">{title}</Text>
          </HStack>
          <Text marginBottom="0.5rem">{desc}</Text>
        </Box>
        <Flex>
          <Spacer />
          <Link
            as={RouterLink}
            color="celery-0"
            _hover={{ color: 'celery--6' }}
            alignSelf="end"
            textStyle="display-xl"
            to={DAO_ROUTES.dao.relative(network, address)}
          >
            {t('featureLink')}
          </Link>
        </Flex>
      </StyledBox>
    </Box>
  );
}
