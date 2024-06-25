import { Flex, Text } from '@chakra-ui/react';
import { zeroAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix } from '../../../utils/url';
import { Card } from '../../ui/cards/Card';
import Avatar from '../../ui/page/Header/Avatar';
// import { Hat } from '@hatsprotocol/sdk-v1-subgraph';

export interface RoleCardProps {
  // hat: Hat
}

export function RoleCard({}: RoleCardProps) {
  // (mock) addresses of wearers
  const wearers = [zeroAddress];
  // (mock) role name of hat
  const roleName = 'Role Name';

  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: wearers[0],
    chainId: getChainIdFromPrefix(addressPrefix),
  });

  const avatarURL = useAvatar(wearers[0]);
  return (
    <Card mb="0.5rem">
      <Flex>
        <Avatar
          size="lg"
          address={wearers[0]}
          url={avatarURL}
        />
        <Flex
          direction="column"
          ml="1rem"
        >
          <Text
            textStyle="display-lg"
            color="white-0"
          >
            {roleName}
          </Text>

          <Text
            textStyle="button-small"
            color="neutral-7"
          >
            {accountDisplayName}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
