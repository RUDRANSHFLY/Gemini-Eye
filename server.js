/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upLoad = multer({ storage: storage }).single("file");

const PORT = 8000;
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});

let filePath;

app.post("/upload", (req, res) => {
  upLoad(req, res, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    filePath = req.file.path;
  });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_EYE);
const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

app.post("/gemini-eye", async (req, res) => {
  try {
    const prompt = req.body.message;
    const inputImage = [fileToGenerativePart(filePath, "image/jpeg")];

    const result = await genModel.generateContent([prompt, ...inputImage]);
    const response = result.response.text();
    return res.send(response);
  } catch (err) {
    console.log(err);
  }
});
