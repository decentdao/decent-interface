export const HEADER_HEIGHT = '4.5rem';
const FOOTER_HEIGHT = '7.625rem';
export const CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT})`;

// TODO get these into `decent-ui` repo
export const BACKGROUND_SEMI_TRANSPARENT = '#16121980';
export const NEUTRAL_2_82_TRANSPARENT = '#221D25D6';

/**
 * Max width for most informational Tooltips. However we don't add max width
 * to some Tooltips that shouldn't wrap no matter how long, such as token amounts.
 */
export const TOOLTIP_MAXW = '18rem';
export const CONTENT_MAXW = 'calc(100vw - 3rem)';
export const ADDRESS_MULTISIG_METADATA = '0xdA00000000000000000000000000000000000Da0';
