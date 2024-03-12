import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/ui/page/Layout';
import FourOhFourPage from './pages/404';
import DAOController from './pages/DAOController';
import HomePage from './pages/HomePage';
import DaoCreatePage from './pages/create';
import DaoDashboardPage from './pages/daos/[daoAddress]/DaoDashboardPage';
import ModifyGovernancePage from './pages/daos/[daoAddress]/edit/governance';
import HierarchyPage from './pages/daos/[daoAddress]/hierarchy';
import SubDaoCreate from './pages/daos/[daoAddress]/new';
import ProposalTemplatesPage from './pages/daos/[daoAddress]/proposal-templates';
import CreateProposalTemplatePage from './pages/daos/[daoAddress]/proposal-templates/new';
import ProposalsPage from './pages/daos/[daoAddress]/proposals';
import ProposalDetailsPage from './pages/daos/[daoAddress]/proposals/[proposalId]';
import ProposalCreatePage from './pages/daos/[daoAddress]/proposals/new';
import SettingsPage from './pages/daos/[daoAddress]/settings';
import Treasury from './pages/daos/[daoAddress]/treasury';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/create',
        element: <DaoCreatePage />,
      },
      {
        path: 'daos/:daoAddress',
        element: <DAOController />,
        children: [
          {
            index: true,
            element: <DaoDashboardPage />,
          },
          {
            path: 'edit/governance',
            element: <ModifyGovernancePage />,
          },
          {
            path: 'hierarchy',
            element: <HierarchyPage />,
          },
          {
            path: 'new',
            element: <SubDaoCreate />,
          },
          {
            path: 'proposal-templates',
            children: [
              {
                index: true,
                element: <ProposalTemplatesPage />,
              },
              {
                path: 'new',
                element: <CreateProposalTemplatePage />,
              },
            ],
          },
          {
            path: 'proposals',
            children: [
              {
                index: true,
                element: <ProposalsPage />,
              },
              {
                path: ':proposalId',
                element: <ProposalDetailsPage />,
              },
              {
                path: 'new',
                element: <ProposalCreatePage />,
              },
            ],
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'treasury',
            element: <Treasury />,
          },
        ],
      },
      {
        path: '*', // 404
        element: <FourOhFourPage />,
      },
    ],
  },
]);

export default router;
