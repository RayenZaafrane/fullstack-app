const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { people: [], transactions: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { people: [], transactions: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAll() {
  const data = readData();
  return data.people || [];
}

function getAllTransactions() {
  const data = readData();
  return data.transactions || [];
}

function addPerson(fields) {
  const data = readData();
  data.people = data.people || [];
  data.transactions = data.transactions || [];
  const now = new Date().toISOString();

  // normalize names for matching
  const first = String(fields.firstName || '').trim();
  const last = String(fields.lastName || '').trim();

  // find existing person by first+last
  let person = data.people.find(p => String(p.firstName || '').trim() === first && String(p.lastName || '').trim() === last);
  if (!person) {
    // create new aggregated person record with usd/eur balances
    person = {
      id: Date.now(),
      firstName: first,
      lastName: last,
      usd: 0,
      eur: 0,
      createdAt: now,
      updatedAt: now
    };
    data.people.push(person);
  }

  // Store original inputted amount and currency in a transaction record
  let inputAmount = null;
  let inputCurrency = null;

  // If amount and currency provided, update balances
  if (fields.amount !== undefined && fields.amount !== null && !Number.isNaN(Number(fields.amount)) && fields.currency) {
    const amt = Number(fields.amount);
    const curr = String(fields.currency).toUpperCase();
    
    // Store the original input
    inputAmount = amt;
    inputCurrency = curr;
    
    if (curr === 'USD') {
      person.usd = (Number(person.usd) || 0) + amt;
    } else if (curr === 'EUR') {
      person.eur = (Number(person.eur) || 0) + amt;
      // if an usdEquivalent is provided, also add to USD balance
      if (fields.usdEquivalent !== undefined && fields.usdEquivalent !== null && !Number.isNaN(Number(fields.usdEquivalent))) {
        person.usd = (Number(person.usd) || 0) + Number(fields.usdEquivalent);
      }
    } else {
      // For any other currency, assume amounts are already provided separately
      // Check if usdEquivalent and eurEquivalent are provided (e.g., from TND conversion)
      if (fields.usdEquivalent !== undefined && !Number.isNaN(Number(fields.usdEquivalent))) {
        person.usd = (Number(person.usd) || 0) + Number(fields.usdEquivalent);
      }
      if (fields.eurEquivalent !== undefined && !Number.isNaN(Number(fields.eurEquivalent))) {
        person.eur = (Number(person.eur) || 0) + Number(fields.eurEquivalent);
      }
    }
    person.updatedAt = now;
  }

  // Add transaction record with original inputted values
  if (inputAmount !== null && inputCurrency !== null) {
    const transaction = {
      id: Date.now() + Math.random(),
      firstName: first,
      lastName: last,
      amount: inputAmount,
      currency: inputCurrency,
      createdAt: now
    };
    data.transactions.push(transaction);
  }

  writeData(data);
  return person;
}

function clearAll() {
  const data = { people: [], transactions: [] };
  writeData(data);
  return true;
}

function removePerson(id) {
  const data = readData();
  const before = (data.people || []).length;
  data.people = (data.people || []).filter(p => String(p.id) !== String(id));
  const after = data.people.length;
  writeData(data);
  return after < before;
}

module.exports = { getAll, getAllTransactions, addPerson, clearAll, removePerson };

