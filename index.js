import app from "./src/app.js";
import { sequelize } from "./src/database/database.js";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Database is connected");
    app.listen(5000, () => {
      console.log("Server is listening on port 5000");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
