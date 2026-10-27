require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
let memoryComplaints = [];
let collection = null;
async function connectDB() {
  if (!process.env.MONGODB_URI) return;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'citycare');
  collection = db.collection('complaints');
  await collection.createIndex({ trackingId: 1 }, { unique: true });
  console.log('MongoDB connected');
}
function makeTrackingId() { return 'CC' + Date.now().toString().slice(-8) + Math.floor(Math.random()*90+10); }
app.get('/api/health', (_req,res) => res.json({ ok: true, database: collection ? 'mongodb' : 'temporary-memory' }));
app.post('/api/complaints', async (req,res) => {
  try {
    const { name, phone, category, description, address, latitude, longitude } = req.body || {};
    if (!name || !category || !description || !address) return res.status(400).json({ error: 'Please fill name, category, description and address.' });
    const complaint = { trackingId: makeTrackingId(), name: String(name).trim(), phone: String(phone || '').trim(), category, description: String(description).trim(), address: String(address).trim(), latitude: Number.isFinite(latitude) ? latitude : null, longitude: Number.isFinite(longitude) ? longitude : null, status: 'Submitted', createdAt: new Date().toISOString() };
    if (collection) await collection.insertOne(complaint); else memoryComplaints.unshift(complaint);
    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save complaint. Check server configuration.' }); }
});
app.get('/api/complaints/:trackingId', async (req,res) => {
  try {
    const id = String(req.params.trackingId).trim().toUpperCase();
    const c = collection ? await collection.findOne({ trackingId: id }, { projection: { _id: 0 } }) : memoryComplaints.find(x => x.trackingId === id);
    if (!c) return res.status(404).json({ error: 'Complaint not found. Check your tracking ID.' });
    res.json(c);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Unable to look up complaint.' }); }
});
app.get('/api/admin/complaints', async (req,res) => {
  const key = process.env.ADMIN_KEY;
  if (!key || req.headers['x-admin-key'] !== key) return res.status(401).json({ error: 'Invalid admin key. Set ADMIN_KEY in environment settings.' });
  try {
    const list = collection ? await collection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray() : memoryComplaints;
    res.json(list);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Unable to load complaints.' }); }
});
app.patch('/api/admin/complaints/:trackingId', async (req,res) => {
  const key = process.env.ADMIN_KEY;
  if (!key || req.headers['x-admin-key'] !== key) return res.status(401).json({ error: 'Invalid admin key.' });
  const allowed = ['Submitted','In Progress','Resolved','Rejected'];
  const status = req.body && req.body.status;
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const id = String(req.params.trackingId).trim().toUpperCase();
    if (collection) {
      const result = await collection.updateOne({ trackingId: id }, { $set: { status } });
      if (!result.matchedCount) return res.status(404).json({ error: 'Complaint not found.' });
    } else {
      const item = memoryComplaints.find(x => x.trackingId === id);
      if (!item) return res.status(404).json({ error: 'Complaint not found.' });
      item.status = status;
    }
    res.json({ message: 'Status updated.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not update status.' }); }
});
app.get('*', (_req,res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
connectDB().then(() => app.listen(PORT, () => console.log(`CityCare running on port ${PORT}`))).catch(err => { console.error('Database connection failed:', err.message); process.exit(1); });
