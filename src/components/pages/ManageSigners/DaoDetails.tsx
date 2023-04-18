import { Box, Divider, Stack, Text, Image, Spacer, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function DaoDetails({
  threshold,
  signerCount,
}: {
  threshold: number | undefined;
  signerCount: number | undefined;
}) {
  const { t } = useTranslation(['common']);

  if (!threshold || !signerCount) return <></>;

  return (
    <Box
      bg="black.900-semi-transparent"
      rounded="md"
      px={8}
      py={8}
      minWidth={{ sm: '100%', xl: '35%' }}
      flexGrow={1}
    >
      <Text
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
      >
        {t('daoDetails', { ns: 'common' })}
      </Text>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.700"
      />
      <Flex mt={4}>
        <Box>
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('signersRequired', { ns: 'common' })}
          </Text>
        </Box>
        <Spacer />
        <Box>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >{`${threshold}/${signerCount}`}</Text>
        </Box>
      </Flex>
      <Stack
        direction="row"
        mt={2}
      >
        <Image
          alignSelf="center"
          src="/images/alert-triangle.svg"
          alt="alert triangle"
          w="1.5rem"
          h="1.5rem"
          mt={3}
          mr={1}
        />
        <Stack direction="column">
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            mt={2}
          >
            {t('signersInfo1', { ns: 'common' })}
            <br />
            {t('signersInfo2', { ns: 'common' })}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

export default DaoDetails;
