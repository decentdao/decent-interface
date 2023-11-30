import { DAOMetadata } from '../../types';
import logo from './assets/logo.png';
import metaSectionBackground1 from './assets/meta-section-background-1.png';

const LIZZARDS_DAO_METADATA: DAOMetadata = {
  address: '0x27feCf4E8A4394B1daC54541414b607f88c451F1',
  logo: logo.src,
  headerBackground:
    'linear-gradient(269deg, rgba(110, 97, 240, 0.35) 3.2%, rgba(74, 163, 183, 0.35) 51.2%, rgba(101, 211, 138, 0.35) 98.2%), #000',
  bodyBackground: 'linear-gradient(180deg, #2A2F33 0%, #101212 100%)',
  links: [
    {
      title: 'Eth Lizards White Paper',
      url: 'https://ethlizards.gitbook.io/ethlizards-white-paper/',
    },
    {
      title: 'Eth Lizards Docs',
      url: 'https://ethlizards.io/',
    },
    {
      title: 'Eth Lizards on Discord',
      url: 'https://discord.com/invite/ethlizards',
    },
  ],
  sections: [
    {
      title: 'Description',
      content:
        'Vote here for this proposal or just click on the link to learn more about the proposal',
      background: undefined,
    },
    {
      title: 'Elemental Lizards coming soon',
      content:
        'Designed by gamers for Web3 Gamers, Guild Leaders, and Content Creators. The Elemental Lizards provide battle passes for all Ethlizards gaming experiences, customizable avatars, and exclusive community access for the Community Sub-DAO. Learn more ',
      background: metaSectionBackground1.src,
    },
  ],
};

export default LIZZARDS_DAO_METADATA;
