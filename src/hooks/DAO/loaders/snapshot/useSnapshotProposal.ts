import { gql } from '@apollo/client';
import { useCallback } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { SnapshotProposal } from '../../../../types';
import client from './';

export default function useSnapshotProposal(proposal: SnapshotProposal) {
  const {
    node: { daoSnapshotURL },
  } = useFractal();

  const loadProposal = useCallback(async () => {}, []);
}
