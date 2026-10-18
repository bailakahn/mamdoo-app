// jsconfig.json's aliases resolve for free at Metro-bundle time
// (babel-preset-expo's own resolver), but Jest's module resolution is
// separate from Metro and needs every alias spelled out explicitly here.
const alias = (name, dir) => ({
  [`^${name}$`]: `<rootDir>/${dir}`,
  [`^${name}/(.*)$`]: `<rootDir>/${dir}/$1`,
});

module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  moduleNameMapper: {
    ...alias("_assets", "assets"),
    ...alias("_components", "src/components"),
    ...alias("_atoms", "src/components/atoms"),
    ...alias("_molecules", "src/components/molecules"),
    ...alias("_organisms", "src/components/organisms"),
    ...alias("_navigations", "src/navigations"),
    ...alias("_scenes", "src/scenes"),
    ...alias("_services", "src/services"),
    ...alias("_styles", "src/styles"),
    ...alias("_utils", "src/utils"),
    ...alias("_store", "src/store"),
    ...alias("_hooks", "src/hooks"),
    ...alias("_api", "src/api"),
  },
};
