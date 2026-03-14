const express = require("express");
const cors = require("cors");
const phrasesRouter = require("./routes/phrases");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/", phrasesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
