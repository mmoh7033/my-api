const ALLOWED_CLIENTS = ["KHBAIB", "KHZAIMA", "service-pulse"];
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ServicePulse API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
      {
        url: "https://my-api-u62u.onrender.com",
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
const ALLOWED_SERVICES = ["voice", "video", "hsd"];
const ALLOWED_STATUS = ["active", "inactive"];

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

  // 👉 NEW: validate client-id
  if (!ALLOWED_CLIENTS.includes(clientId)) {
    return res.status(403).json({
      message: "Unauthorized client-id ❌",
      allowed: ALLOWED_CLIENTS
    });
  }

  if (!mobile) {
    return res.status(400).json({ message: "mobile header missing ❌" });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      message: "Invalid mobile number ❌",
      allowed: "10 digits only"
    });
  }

  next();
}
/**
 * @swagger
 * /customer-services:
 *   post:
 *     summary: Create customer services
 *     tags: [Customer Services]
 *     parameters:
 *       - in: header
 *         name: client-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: mobile
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerServicesRequest:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                       example: voice
 *                     status:
 *                       type: string
 *                       example: active
 *                     date:
 *                       type: string
 *                       example: 2026-05-06
 *     responses:
 *       201:
 *         description: Created successfully
 */
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
      service: typeof s.service === "string" ? s.service.trim().toLowerCase() : "",
      status: typeof s.status === "string" ? s.status.trim().toLowerCase() : "",
      date: s.date
    }));
// 🔥 allowed services

// 🔥 validate services
const invalidServices = normalized.filter(
  s => !ALLOWED_SERVICES.includes(s.service)
);

if (invalidServices.length > 0) {
  return res.status(400).json({
    message: "Invalid service name ❌",
    invalid: invalidServices.map(s => s.service)
  });
}

const invalidStatuses = normalized.filter(
  s => !ALLOWED_STATUS.includes(s.status)
);

if (invalidStatuses.length > 0) {
  return res.status(400).json({
    message: "Invalid status ❌",
    allowed: ALLOWED_STATUS,
    invalid: invalidStatuses.map(s => ({
      service: s.service,
      status: s.status
    }))
  });
}

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
/**
 * @swagger
 * /customer-services:
 *   get:
 *     summary: Get customer services
 *     tags: [Customer Services]
 *     parameters:
 *       - in: header
 *         name: client-id
 *         required: true
 *       - in: header
 *         name: mobile
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */
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
/**
 * @swagger
 * /customer-services/{service}:
 *   put:
 *     summary: Update service status
 *     tags: [Customer Services]
 *     parameters:
 *       - in: path
 *         name: service
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: client-id
 *         required: true
 *       - in: header
 *         name: mobile
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Updated successfully
 */


// 🟡 PUT (UPDATE)
app.put('/customer-services/:service', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;
    const service = req.params.service.trim().toLowerCase();

    const status = req.body.status?.trim().toLowerCase();

    // 🔥 VALIDATION
    if (!status || !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message: "Invalid status ❌",
        allowed: ALLOWED_STATUS
      });
    }

    const result = await Service.findOneAndUpdate(
      { clientId, mobile, service },
      { status },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Record not found ❌" });
    }

    res.json({ message: "updated successfully ✔", data: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 /**
 * @swagger
 * /customer-services:
 *   delete:
 *     summary: Delete services
 *     tags: [Customer Services]
 *     parameters:
 *       - in: header
 *         name: client-id
 *         required: true
 *       - in: header
 *         name: mobile
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted successfully
 */ 
app.delete('/customer-services', checkApiKey, async (req, res) => {
  try {
    const clientId = req.headers['client-id'];
    const mobile = req.headers.mobile;

    // 🔥 Safe body handling
    const services = req.body?.services;

    // 🟡 PARTIAL DELETE
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

    // 🔴 FULL DELETE (no body)
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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 🚀 SERVER START
app.listen(3000, () => {
  console.log("Server running on port 3000 🔥");
});
