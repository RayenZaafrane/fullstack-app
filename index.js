const express = require("express");
const path = require("path");
const db = require("./db");
const app = express();
const PORT =  3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Cache for exchange rates
let _cachedRates = null;
let _cachedAt = 0;
const RATE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchRates() {
  const now = Date.now();
  if (_cachedRates && (now - _cachedAt) < RATE_CACHE_TTL) return _cachedRates;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/TND');
    if (!res.ok) throw new Error('Network');
    const data = await res.json();
    if (data && (data.result === 'success')) {
      _cachedRates = data.rates || null;
      _cachedAt = Date.now();
      return _cachedRates;
    }
    return null;
  } catch (e) {
    return null;
  }
}

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

app.get("/api/transactions", (req, res) => {
  try {
    const transactions = db.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to read transactions" });
  }
});

app.post("/api/people", async (req, res) => {
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
    if (currency) payload.currency = String(currency).toUpperCase();

    // If TND is provided, convert to USD and EUR
    if (payload.currency === 'TND' && payload.amount) {
      const rates = await fetchRates();
      if (rates && typeof rates.USD === 'number' && typeof rates.EUR === 'number') {
        const usdAmount = payload.amount * rates.USD;
        const eurAmount = payload.amount * rates.EUR;
        // Store as USD amount with conversion info
        payload.currency = 'USD';
        payload.amount = usdAmount;
        payload.usdEquivalent = usdAmount;
        payload.eurEquivalent = eurAmount;
      }
    }

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