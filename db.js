const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { people: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { people: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAll() {
  const data = readData();
  return data.people || [];
}

function addPerson(fields) {
  const data = readData();
  const id = Date.now();
  // allow additional optional fields like amount, currency
  const person = Object.assign({ id, createdAt: new Date().toISOString() }, fields);
  data.people = data.people || [];
  data.people.push(person);
  writeData(data);
  return person;
}

function clearAll() {
  const data = { people: [] };
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

module.exports = { getAll, addPerson, clearAll, removePerson };

