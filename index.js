const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🔥 FIX (IMPORTANT)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "client-id", "mobile"]
}));

app.use(express.json());

// 🔥 MongoDB Connection
mongoose.connect("mongodb://mmohd7033_db_user:6k44G6EvHueFWTfZ@ac-kt5zdne-shard-00-00.nar9cvw.mongodb.net:27017,ac-kt5zdne-shard-00-01.nar9cvw.mongodb.net:27017,ac-kt5zdne-shard-00-02.nar9cvw.mongodb.net:27017/servicepulseDB?ssl=true&replicaSet=atlas-pia3pi-shard-0&authSource=admin&retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("DB Error:", err));

// 🔥 Schema
const serviceSchema = new mongoose.Schema({
  clientId: String,
  mobile: String,
  service: String,
  status: String,
  date: String
});

const Service = mongoose.model("Service", serviceSchema);

// 🔐 API Key Middleware
function checkApiKey(req, res, next) {
  const clientId = req.headers['client-id'];
  const mobile = req.headers.mobile;

  if (!clientId) {
    return res.status(401).json({ message: "client-id missing ❌" });
  }

  if (!mobile) {
    return res.status(400).json({ message: "mobile header missing ❌" });
  }

  next();
}

// 🟢 POST (CREATE)
app.post('/customer-services', checkApiKey, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Body must be an array of service objects" });
    }

    const records = req.body.map(item => {
      if (!item.service || !item.status) {
        throw new Error("Each service must have service and status");
      }

      return {
        clientId: req.headers['client-id'],
        mobile: req.headers.mobile,
        service: item.service.trim().toLowerCase(), // ✅ normalize
        status: item.status,
        date: item.date || new Date().toISOString().split('T')[0]  // default to today if not provided
      };
    });

    await Service.insertMany(records);

    res.json({ message: "Services created successfully ✔" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 GET (READ + CLEAN FORMAT)
app.get('/customer-services', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;

    const records = await Service.find({ clientId, mobile });

    if (records.length === 0) {
      return res.json({ message: "No history found" });
    }

    let services = {};

    records.forEach(r => {
      services[r.service] = {
        id: r._id,
        status: r.status
      };
    });

    res.json({
      clientId,
      mobile,
      services
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 PUT (UPDATE)
app.put('/customer-services/:service', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;
    const service = req.params.service.trim().toLowerCase();

    const result = await Service.updateOne(
      { clientId, mobile, service },
      { status: req.body.status, date: req.body.date }
    );

    if (result.matchedCount === 0) {
      return res.json({ message: "No record found to update ❌" });
    }

    res.json({ message: "updated successfully ✔" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 DELETE (SINGLE SERVICE)
app.delete('/customer-services/:service', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;
    const service = req.params.service.trim().toLowerCase();

    const result = await Service.deleteMany({ clientId, mobile, service });

    if (result.deletedCount === 0) {
      return res.json({ message: "No record found ❌" });
    }

    res.json({
      message: "deleted successfully ✔",
      deletedCount: result.deletedCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🚀 SERVER START
app.listen(3000, () => {
  console.log("Server running on port 3000 🔥");
});