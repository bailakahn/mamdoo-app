require("module-alias/register");
const app = require("./app/app");
const { PORT } = process.env;
const port = PORT || 3005;

app.listen(port, () => console.log(`mamdoo-provider started on port ${port}!`));
