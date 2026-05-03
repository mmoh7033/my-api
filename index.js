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

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      message: "Invalid mobile number ❌"
    });
  }

  next();
}

// 🟢 POST (CREATE)
app.post('/customer-services', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;

    const servicesArray = req.body.customerServicesRequest;

    if (!Array.isArray(servicesArray) || servicesArray.length === 0) {
      return res.status(400).json({ message: "Invalid request body ❌" });
    }

    // 🔥 normalize input
    const normalized = servicesArray.map(s => ({
      service: s.service.trim().toLowerCase(),
      status: s.status.trim().toLowerCase(),
      date: s.date
    }));

    const serviceNames = normalized.map(s => s.service);

    // 🔥 check duplicates in DB
    const existing = await Service.find({
      clientId,
      mobile,
      service: { $in: serviceNames }
    });

    if (existing.length > 0) {
      return res.status(409).json({
        message: "One or more services already exist ❌",
        existingServices: existing.map(e => e.service)
      });
    }

    // 🔥 prepare records
    const records = normalized.map(s => ({
      clientId,
      mobile,
      service: s.service,
      status: s.status,
      date: s.date
    }));

    // 🔥 insert all
    await Service.insertMany(records);

    res.status(201).json({
      message: "All services created successfully ✔",
      count: records.length
    });

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
    const status = req.body.status.trim().toLowerCase();

    // 🔥 Step 1: find existing
    const existing = await Service.findOne({ clientId, mobile, service });

    if (!existing) {
      return res.status(404).json({ message: "Record not found ❌" });
    }

    // 🔥 Step 2: compare
    if (existing.status === status) {
      return res.json({ message: "Already up to date ⚠️" });
    }

    // 🔥 Step 3: update
    existing.status = status;
    await existing.save();

    res.json({ message: "updated successfully ✔", data: existing });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 DELETE PARTIALLY 
app.delete('/customer-services', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;

    const services = req.body.services;

    // 🟡 Partial delete
    if (Array.isArray(services) && services.length > 0) {

      const normalizedServices = services.map(s =>
        s.trim().toLowerCase()
      );

      const result = await Service.deleteMany({
        clientId,
        mobile,
        service: { $in: normalizedServices }
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "No matching services found ❌"
        });
      }

      return res.json({
        message: "Selected services deleted ✔",
        deletedCount: result.deletedCount
      });
    }

    // 🔴 Full delete (your existing logic)
    const result = await Service.deleteMany({ clientId, mobile });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "No records found ❌"
      });
    }

    res.json({
      message: "All services deleted successfully ✔",
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