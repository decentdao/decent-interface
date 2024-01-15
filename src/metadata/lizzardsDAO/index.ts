import { DAOMetadata } from '../../types';
import logo from './assets/logo.png';
import metaSectionBackground1 from './assets/meta-section-background-1.png';

const LIZZARDS_DAO_METADATA: DAOMetadata = {
  address: '0x167bE4073f52aD2Aa0D6d6FeddF0F1f79a82B98e',
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
      content: ' for this proposal or just click on the link to learn more about the proposal',
      background: undefined,
      link: {
        position: 'start',
        text: 'Vote here',
        url: '/proposals/0xe10c44fceb1b43f74c42bd6efc9316e9ce14109ac8a166e5266fc78499cb4fea',
      },
    },
    {
      title: 'Elemental Lizards coming soon',
      content:
        'Designed by gamers for Web3 Gamers, Guild Leaders, and Content Creators. The Elemental Lizards provide battle passes for all Ethlizards gaming experiences, customizable avatars, and exclusive community access for the Community Sub-DAO. ',
      background: metaSectionBackground1.src,
      link: {
        position: 'end',
        text: 'Learn more',
        url: 'https://ethlizards.io/#lizards',
      },
    },
  ],
};

export default LIZZARDS_DAO_METADATA;
