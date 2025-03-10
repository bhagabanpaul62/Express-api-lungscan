const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3009;

app.use(express.json());
app.use(cors({ origin: "*" }));

const upload = multer({ dest: "uploads/" });

app.post("/predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.resolve(req.file.path);
    console.log("✅ File received:", imagePath);
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    const response = await axios.post(
      "https://flask-api-g4ld.onrender.com/predict",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // Cleanup: Delete the uploaded file after processing
    fs.unlinkSync(imagePath);
    console.log("✅ Flask API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error processing image:", error.message);
    res.status(500).json({
      error: error.response ? error.response.data : "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
