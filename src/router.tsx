import { wrapCreateBrowserRouter } from '@sentry/react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { ModalProvider } from './components/ui/modals/ModalProvider';
import Layout from './components/ui/page/Layout';
import { TopErrorFallback } from './components/ui/utils/TopErrorFallback';
import FourOhFourPage from './pages/404';
import DAOController from './pages/DAOController';
import HomePage from './pages/HomePage';
import DaoCreatePage from './pages/create';
import DaoDashboardPage from './pages/daos/[daoAddress]/DaoDashboardPage';
import { SettingsPage } from './pages/daos/[daoAddress]/SettingsPage';
import ModifyGovernancePage from './pages/daos/[daoAddress]/edit/governance';
import HierarchyPage from './pages/daos/[daoAddress]/hierarchy';
import SubDaoCreate from './pages/daos/[daoAddress]/new';
import ProposalTemplatesPage from './pages/daos/[daoAddress]/proposal-templates';
import CreateProposalTemplatePage from './pages/daos/[daoAddress]/proposal-templates/new';
import ProposalsPage from './pages/daos/[daoAddress]/proposals';
import ProposalDetailsPage from './pages/daos/[daoAddress]/proposals/[proposalId]';
import ProposalCreatePage from './pages/daos/[daoAddress]/proposals/new';
import Treasury from './pages/daos/[daoAddress]/treasury';

export const router = (addressPrefix: string) =>
  wrapCreateBrowserRouter(createBrowserRouter)([
    {
      path: '/',
      element: (
        // We're placing ModalProvider here instead of src/providers/Providers.tsx due to the need of having router context
        // within underlying modals. Otherwise - trying to invoke routing-related hooks would lead to crash.
        // Not the best place to have this provider here but also more reasonalbe than putting that into <Layout />
        <ModalProvider>
          <Layout />
        </ModalProvider>
      ),
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'create',
          element: <DaoCreatePage />,
        },
        {
          path: 'error',
          element: <TopErrorFallback />,
        },
        {
          path: '/',
          element: <DAOController />,
          children: [
            {
              path: 'home',
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
          // this exists to keep old links working
          // /daos/0x0123/* will redirect to /home?dao=0x0123
          path: 'daos/:daoAddress/*',
          // @ts-ignore:next-line
          loader: ({ params: { daoAddress } }) =>
            redirect(`/home?dao=${addressPrefix}:${daoAddress}`),
        },
        {
          path: '*', // 404
          element: <FourOhFourPage />,
        },
      ],
    },
  ]);

export default router;
