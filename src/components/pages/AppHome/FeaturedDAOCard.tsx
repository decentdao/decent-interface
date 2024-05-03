import { Text, VStack, Flex, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../constants/routes';
import { Badge } from '../../ui/badges/Badge';
import { StyledBox } from '../../ui/containers/StyledBox';

export interface FeaturedDAO {
  iconSrc: string;
  iconBg?: string;
  iconRounded?: boolean;
  titleKey: string;
  network: string;
  networkName: string;
  votingStrategy: string;
  address: string;
}
interface FeaturedDAOCardProps {
  item: FeaturedDAO;
}

export default function FeaturedDAOCard({
  item: {
    iconSrc,
    iconBg = 'lilac-0',
    iconRounded = false,
    titleKey,
    network,
    address,
    networkName,
    votingStrategy,
  },
}: FeaturedDAOCardProps) {
  const { t } = useTranslation('home');
  return (
    <StyledBox
      width={{ base: '100%', md: 'calc(50% - 0.75rem)', xl: 'calc(25% - 0.75rem)' }}
      to={DAO_ROUTES.dao.relative(network, address)}
    >
      <VStack
        justifyContent="center"
        gap="0.5rem"
      >
        <Flex
          width="80px"
          height="80px"
          bg={iconBg}
          justifyContent="center"
          alignItems="center"
          borderRadius="50%"
        >
          <Image
            src={iconSrc}
            alt={t(titleKey)}
            width="auto"
            height="auto"
            borderRadius={iconRounded ? '50%' : '0'}
          />
        </Flex>
        <Text textStyle="display-xl">{t(titleKey)}</Text>
        <Flex
          gap="0.5rem"
          mt="1rem"
        >
          <Badge
            labelKey="ownerApproved"
            size="sm"
          >
            {networkName}
          </Badge>
          <Badge
            labelKey="ownerApproved"
            size="sm"
          >
            {votingStrategy}
          </Badge>
        </Flex>
      </VStack>
    </StyledBox>
  );
}
