import React, { useState } from 'react';
import Fractalize from './Fractalize';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import { GovernanceProposalData } from '../../controller/Modules/types';

enum View {
  Cards,
  CreateDAO,
}

function CreateDAOCard({ disabled, onClick }: { onClick: () => void; disabled?: boolean }) {
  return (
    <PrimaryButton
      label="Create a subDAO"
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
  return (
    <div>
      <SecondaryButton
        label="back"
        className="mb-4"
        onClick={() => setView(View.Cards)}
      />
      {children}
    </div>
  );
}

interface IPlugins extends GovernanceProposalData {}

function Plugins(props: IPlugins) {
  const [view, setView] = useState(View.Cards);

  switch (view) {
    case View.CreateDAO: {
      return (
        <CardDetails setView={setView}>
          <Fractalize {...props} />
        </CardDetails>
      );
    }
    case View.Cards:
    default: {
      return (
        <div className="flex flex-wrap">
          <CreateDAOCard
            onClick={() => setView(View.CreateDAO)}
            disabled={!props.isAuthorized}
          />
        </div>
      );
    }
  }
}

export default Plugins;
