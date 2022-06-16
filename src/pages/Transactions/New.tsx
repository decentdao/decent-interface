import React, { useState } from 'react';
import DaoCreator from '../../components/DaoCreator';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';

enum View {
  Cards,
  CreateDAO,
}

function CreateDAOCard({ onClick }: { onClick: () => void }) {
  return (
    <PrimaryButton
      label="Create a SubDAO"
      onClick={onClick}
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

function New() {
  const [view, setView] = useState(View.Cards);

  switch (view) {
    case View.CreateDAO: {
      return (
        <CardDetails setView={setView}>
          <DaoCreator />
        </CardDetails>
      );
    }
    case View.Cards:
    default: {
      return (
        <div className="flex flex-wrap">
          <CreateDAOCard onClick={() => setView(View.CreateDAO)} />
        </div>
      );
    }
  }
}

export default New;
