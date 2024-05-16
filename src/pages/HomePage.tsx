import { VStack, Text, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CTABox from '../components/pages/AppHome/CTABox';
import { CreateDAOIllustration, DocsIllustration } from '../components/ui/icons/Icons';
import { CONTENT_MAXW } from '../constants/common';
import { BASE_ROUTES } from '../constants/routes';
import { URL_DOCS } from '../constants/url';
import { useFractal } from '../providers/App/AppProvider';

export default function HomePage() {
  const { t } = useTranslation('home');
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  useEffect(() => {
    if (daoAddress) {
      action.resetDAO();
    }
  }, [daoAddress, action]);

  return (
    <Flex flexWrap="wrap">
      <VStack
        maxW={CONTENT_MAXW}
        flex="1"
        alignItems="start"
        pt="3rem"
        px="1.5rem"
      >
        <Text textStyle="display-xl">{t('homeTitle')}</Text>
        <Flex
          mt="1.5rem"
          gap="1.5rem"
          w="full"
          flexWrap="wrap"
        >
          <CTABox
            titleKey="createCTA"
            descKey="createDesc"
            to={BASE_ROUTES.create}
            Icon={<CreateDAOIllustration />}
            titleColor="cosmic-nebula-0"
            descColor="cosmic-nebula-0"
            bg="lilac-0"
          />
          <CTABox
            to={URL_DOCS}
            target="_blank"
            titleKey="docsCTA"
            descKey="docsDesc"
            Icon={<DocsIllustration />}
            pr={0}
            iconContainerJustify="flex-end"
          />
        </Flex>
      </VStack>
    </Flex>
  );
}
