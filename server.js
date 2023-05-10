const app = require("./app");
const mongoose = require("mongoose");

const { DB_URI, PORT } = process.env;

mongoose
  .connect(DB_URI)
  .then(
    app.listen(PORT, () => {
      console.log("Database connection successful");
    })
  )
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
