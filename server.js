const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const tests = {
  "X-Ray": [
    { name: "Chest X-Ray", price: 300 },
    { name: "Spine X-Ray", price: 450 },
    { name: "Knee X-Ray", price: 350 },
    { name: "Hand / Wrist X-Ray", price: 300 }
  ],
  "CT Scan": [
    { name: "CT Brain", price: 2500 },
    { name: "CT Chest", price: 3500 },
    { name: "CT Abdomen", price: 4000 },
    { name: "CT Spine", price: 3800 }
  ],
  "Sonography": [
    { name: "Abdomen Sonography", price: 800 },
    { name: "Pelvis Sonography", price: 800 },
    { name: "Pregnancy Sonography", price: 900 },
    { name: "Thyroid Sonography", price: 700 }
  ],
  "Laboratory": [
    { name: "CBC (Complete Blood Count)", price: 250 },
    { name: "Blood Sugar (Fasting / PP)", price: 100 },
    { name: "Lipid Profile", price: 600 },
    { name: "Thyroid Profile (T3 T4 TSH)", price: 500 },
    { name: "Urine Routine", price: 100 }
  ]
};

function readFile(name) {
  const file = path.join(__dirname, 'data', name);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
}
function saveFile(name, list) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'data', name), JSON.stringify(list, null, 2));
}

// सर्व टेस्ट
app.get('/api/tests', (req, res) => res.json(tests));

// अपॉइंटमेंट बुक करणे
app.post('/api/appointments', (req, res) => {
  const { name, phone, date, category, test } = req.body;
  if (!name || !/^\d{10}$/.test(phone || '') || !date || !category || !test) {
    return res.status(400).json({ message: 'कृपया सर्व माहिती बरोबर भरा (मोबाईल 10 अंकी).' });
  }
  const list = readFile('appointments.json');
  list.push({ id: Date.now(), name, phone, date, category, test, status: 'Pending', createdAt: new Date().toISOString() });
  saveFile('appointments.json', list);
  res.json({ message: 'अपॉइंटमेंट यशस्वीरित्या बुक झाली! आम्ही लवकरच संपर्क करू.' });
});

// संपर्क संदेश
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'कृपया सर्व माहिती भरा.' });
  }
  const list = readFile('messages.json');
  list.push({ id: Date.now(), name, email, message, createdAt: new Date().toISOString() });
  saveFile('messages.json', list);
  res.json({ message: 'तुमचा संदेश मिळाला. धन्यवाद!' });
});
// ---------- Admin ----------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';   // हा पासवर्ड नक्की बदला

function checkAdmin(req, res, next) {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'चुकीचा पासवर्ड' });
  }
  next();
}

// सर्व अपॉइंटमेंट्स
app.get('/api/admin/appointments', checkAdmin, (req, res) => {
  res.json(readFile('appointments.json').reverse());
});

// सर्व संदेश
app.get('/api/admin/messages', checkAdmin, (req, res) => {
  res.json(readFile('messages.json').reverse());
});

// अपॉइंटमेंट डिलीट करणे
app.delete('/api/admin/appointments/:id', checkAdmin, (req, res) => {
  const list = readFile('appointments.json').filter(a => String(a.id) !== req.params.id);
  saveFile('appointments.json', list);
  res.json({ message: 'डिलीट झाले' });
});
const PORT = process.env.PORT || 3000;;
app.listen(PORT, () => console.log(`Server चालू आहे: http://localhost:${PORT}`));