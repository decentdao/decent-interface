import { Divider, HStack, Flex, Text, Image, Box } from '@chakra-ui/react';
import { SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { useTranslation } from 'react-i18next';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
import EtherscanLink from '../../../ui/links/EtherscanLink';

export function NFTHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box marginBottom="1rem">
      <Divider
        variant="white"
        marginTop="0.75rem"
        marginBottom="1.5rem"
      />
      <Text
        textStyle="label-small"
        color="neutral-7"
        px={{ base: '1rem', lg: '1.5rem' }}
      >
        {t('columnNFTs')}
      </Text>
    </Box>
  );
}

export function NFTRow({ asset, isLast }: { asset: SafeCollectibleResponse; isLast: boolean }) {
  const image = asset.imageUri ? asset.imageUri : asset.logoUri;
  const name = asset.name ? asset.name : asset.tokenName;
  const id = asset.id.toString();

  return (
    <HStack
      marginBottom={isLast ? '0rem' : '1.5rem'}
      px={{ base: '1rem', lg: '1.5rem' }}
      justifyContent="space-between"
    >
      <Flex width="15%">
        <EtherscanLink
          type="token"
          value={asset.address}
          secondaryValue={id}
          data-testid="link-nft-image"
          padding={0}
          _hover={{ bg: 'transparent' }}
        >
          <Image
            src={image}
            fallbackSrc="/images/nft-image-default.svg"
            alt={name}
            w="3rem"
            h="3rem"
          />
        </EtherscanLink>
      </Flex>
      <Flex width="45%">
        <EtherscanLink
          type="address"
          value={asset.address}
          _hover={{ bg: 'transparent' }}
          color="white-0"
          textStyle="body-base"
          wordBreak="break-word"
        >
          {name}
        </EtherscanLink>
      </Flex>
      <Flex width="40%">
        <EtherscanLink
          type="token"
          value={asset.address}
          secondaryValue={id}
          color="white-0"
          textStyle="body-base"
          _hover={{ bg: 'transparent' }}
        >
          <Text as="span">{`#${createAccountSubstring(id)}`}</Text>
        </EtherscanLink>
      </Flex>
    </HStack>
  );
}
