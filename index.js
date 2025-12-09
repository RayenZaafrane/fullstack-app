const express = require("express");
const path = require("path");
const db = require("./db");
const app = express();
const PORT =  3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/people", (req, res) => {
  try {
    const people = db.getAll();
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

app.post("/api/people", (req, res) => {
  const { firstName, lastName, amount, currency } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "firstName and lastName are required" });
  }
  try {
    const payload = { firstName, lastName };
    if (amount !== undefined && amount !== null && amount !== '') {
      const n = Number(amount);
      if (!Number.isNaN(n)) payload.amount = n;
    }
    if (currency) payload.currency = String(currency);
    const person = db.addPerson(payload);
    res.status(201).json(person);
  } catch (err) {
    res.status(500).json({ error: "Failed to save person" });
  }
});

// Delete all people (clears persisted data)
app.delete('/api/people', (req, res) => {
  try {
    db.clearAll();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Delete a single person by id
app.delete('/api/people/:id', (req, res) => {
  const id = req.params.id;
  try {
    const ok = db.removePerson(id);
    if (ok) return res.json({ ok: true });
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));