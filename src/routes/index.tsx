export const fractalRoutes = {
  base: '/',
  create: '/daos/new',
  daos: '/daos',
  // DAO address required
  dao: (daoAddress: string) => `/daos/${daoAddress}`,

  daoModule: (daoAddress: string, moduleAddress: string) =>
    `/daos/${daoAddress}/module/${moduleAddress}`,

  plugins: (daoAddress: string) => `/daos/${daoAddress}/plugins`,
};

export default function FractalRoutes() {
  return <div></div>;
}
