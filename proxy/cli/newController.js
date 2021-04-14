const argv = require("yargs").parse();
const fs = require("fs");
const ora = require("ora");
const fsExtra = require("fs-extra");
const beautify = require("js-beautify").js;

const { post, p: controller, public } = argv;

const spinner = ora(`Adding new Controller ${controller}`).start();

const path = `controllers/${controller}`;

if (fs.existsSync(path)) {
  spinner.fail("This controller already exists");
  return;
}

//copy the controller template
fsExtra
  .copy("templates/controller/", path)
  .then(() => {
    spinner.text = "Configuring the new controller";
    // get the empty config json
    const config = JSON.parse(fs.readFileSync(`${path}/config.json`));

    config.Method = (post && "POST") || "GET";

    // rewrites the config with the controller config
    fs.writeFileSync(
      `${path}/config.json`,
      JSON.stringify(config, null, 2),
      "utf8"
    );

    // rename the main unit by the controller name
    fsExtra.moveSync(
      `${path}/units/controller.js`,
      `${path}/units/${controller}.js`
    );

    // update the units index file
    fs.writeFileSync(
      `${path}/units/index.js`,
      `module.exports.${controller} = require("./${controller}.js")`,
      "utf8"
    );

    // update the main file
    if (!public)
      fs.writeFileSync(
        `${path}/index.js`,
        beautify(`const { ${controller} } = require("./units");
      const auth = require("_app/auth");
      
      module.exports = async (io, message) => {
        return await auth(message, async (user) => {
          return await ${controller}();
        });
      };`),
        "utf8"
      );
    else
      fs.writeFileSync(
        `${path}/index.js`,
        beautify(`const { ${controller} } = require("./units");
      
      module.exports = async (io, message) => {
          return await ${controller}();
      };`),
        "utf8"
      );

    spinner.succeed(`Successfully added controller ${controller}`);
  })
  .catch((err) => console.log(err));
