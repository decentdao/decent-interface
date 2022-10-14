import React, { useState } from 'react';
import Fractalize from './Fractalize';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import { useGovernanceInjector } from '../../controller/Modules/injectors/GovernanceInjectorConext';
import { useTranslation } from 'react-i18next';

enum View {
  Cards,
  CreateDAO,
}

function CreateDAOCard({ disabled, onClick }: { onClick: () => void; disabled?: boolean }) {
  const { t } = useTranslation('daoCreate');
  return (
    <PrimaryButton
      label={t('labelCreateSubDAO')}
      onClick={onClick}
      disabled={disabled}
    />
  );
}

function CardDetails({
  setView,
  children,
}: {
  setView: (value: React.SetStateAction<View>) => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <SecondaryButton
        label={t('back')}
        className="mb-4"
        onClick={() => setView(View.Cards)}
      />
      {children}
    </div>
  );
}

function Plugins() {
  const [view, setView] = useState(View.Cards);
  const { isAuthorized } = useGovernanceInjector();

  switch (view) {
    case View.CreateDAO: {
      return (
        <CardDetails setView={setView}>
          <Fractalize />
        </CardDetails>
      );
    }
    case View.Cards:
    default: {
      return (
        <div className="flex flex-wrap">
          <CreateDAOCard
            onClick={() => setView(View.CreateDAO)}
            disabled={!isAuthorized}
          />
        </div>
      );
    }
  }
}

export default Plugins;
