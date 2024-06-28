const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 3001;
app.use(express.json());

app.use("/api", userRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to mongo: ${error.message}`);
  });
