import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ContentBox from '../../components/ui/ContentBox';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';

function Home() {
  const { t } = useTranslation('daoCreate');
  return (
    <div>
      <H1>{t('createHead')}</H1>
      <ContentBox title={t('createSubhead')}>
        <div className="md:grid md:grid-cols-2 gap-6 flex flex-col items-center py-4">
          <Link
            to="/daos/new"
            className="w-full"
          >
            <PrimaryButton
              label={t('buttonCreate')}
              isLarge
              className="w-full"
            />
          </Link>
          <Link
            to="/daos"
            className="w-full"
          >
            <SecondaryButton
              label={t('buttonFind')}
              isLarge
              className="w-full"
            />
          </Link>
        </div>
      </ContentBox>
    </div>
  );
}

export default Home;
