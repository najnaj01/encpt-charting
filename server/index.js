import express from "express";
import cors from "cors";
import Ajv from "ajv";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const schema = JSON.parse(fs.readFileSync("../schemas/encpt-note.schema.json", "utf8"));
const terms = JSON.parse(fs.readFileSync("./terms.json", "utf8"));
const validate = new Ajv({ allErrors: true }).compile(schema);
const notes = [];

app.get("/terms", (req, res) => res.json(terms));
app.get("/notes", (req, res) => res.json(notes));

app.post("/notes", (req, res) => {
  if (!validate(req.body)) {
    return res.status(400).json({ valid: false, errors: validate.errors });
  }
  const saved = { id: notes.length + 1, createdAt: new Date().toISOString(), ...req.body };
  notes.push(saved);
  res.status(201).json(saved);
});

app.listen(3001, () => console.log("API on http://localhost:3001"));