// Lets several versions of the prototype run side by side. Set MOSEY_VERSION
// (the ./demo launcher does) and each gets its own name, slug and URL scheme,
// so Expo Go and deep links keep them apart. Without it nothing changes.
module.exports = ({ config }) => {
  const version = process.env.MOSEY_VERSION;
  if (!version) return config;
  return {
    ...config,
    name: `Mosey · ${version}`,
    slug: `mosey-${version}`,
    scheme: `mosey-${version}`,
  };
};
