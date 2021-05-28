const express = require("express");

const { getApplication, submitApplication } = require("./apis");
const app = express();

app.use(express.json({ limit: "300mb", extended: true }));
app.use(express.urlencoded({ limit: "300mb", extended: true }));

app.get("/application", async (req, res) => {
  try {
    const { data = null, status = 0 } = await getApplication();
    if (data && status === 200) {
      const { id: questionId, nums = null } = data;
      if (questionId && nums) return res.status(200).send({ message: "Application fetched successfully", error: false, data: { questionId, nums } });
    }
    return res.status(400).send({ message: "something went wrong", error: true, data: null })
  } catch (ex) {
    return res.status(500).send({
      message: "internal server error",
      error: true,
      errorDesc: ex.message,
      data: null,
    });
  }
});
app.post("/upload", async (req, res) => {
  try {
    const {
      error = false,
      errorDesc = null,
      message = null,
      result,
    } = await submitApplication(req.body);
    if (error) {
      return res.status(400).send({
        message: "Bad Request",
        error,
        errorDesc,
        data: null,
      });
    }
    return res.status(200).send({
      message,
      error: false,
      data: result,
    });
  } catch (ex) {
    return res.status(500).send({
      message: "internal server error",
      error: true,
      errorDesc: ex.message,
      data: null,
    });
  }
});
app.use((req, res) => {
  res.status(404).send({
    error: true,
    errorDesc: "endpoint not found",
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, (_) => console.log(`APP is listening at PORT: ${PORT}`));
