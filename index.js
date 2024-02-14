const makeApp = require("./src/app.js");
const sequelize = require("./src/database/database.js");

const app = makeApp();

app.listen(5000, async () => {
  await sequelize.authenticate();
});
