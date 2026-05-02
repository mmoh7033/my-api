const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = "MMM-KHU123";

let services = [];

function checkApiKey(req, res, next) {
    const clientId = req.headers['client-id'];

    if (!clientId) {
        return res.status(401).json({ message: "client-id missing" });
    }

    if (clientId !== API_KEY) {
        return res.status(403).json({ message: "invalid client-id" });
    }

    next();
}

/* ================= POST ================= */
app.post('/customer-services', checkApiKey, (req, res) => {
    const mobile = req.headers.mobile;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile header required" });
    }

    const record = {
        mobile: mobile,
        service: req.body.service,
        status: req.body.status,
        date: req.body.date,
        amount: req.body.amount
    };

    services.push(record);

    res.status(201).json(record);
});


/* ================= GET ================= */
app.get('/customer-services', checkApiKey, (req, res) => {
    const mobile = req.headers.mobile;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile header required" });
    }

    const result = services.filter(s => s.mobile === mobile);

    if (result.length === 0) {
        return res.status(404).json({ message: "No history found" });
    }

    let lobStatus = {};

    result.forEach(s => {
        if (s.status === "disconnected") {
            lobStatus[s.service] = {
                status: "disconnected",
                disconnectedDate: s.date,
                adjustedAmnt: s.amount || "0"
            };
        } else {
            lobStatus[s.service] = "activated";
        }
    });

    const response = {
        MobileDetails: [
            {
                mobileNo: mobile,
                lobStatus: lobStatus
            }
        ]
    };

    res.json(response);
});


/* ================= PUT ================= */
app.put('/customer-services/:service', checkApiKey, (req, res) => {
    const mobile = req.headers.mobile;
    const service = req.params.service;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile header required" });
    }

    let found = false;

    services = services.map(s => {
        if (s.mobile === mobile && s.service === service) {
            found = true;
            return {
                ...s,
                status: req.body.status || s.status,
                date: req.body.date || s.date,
                amount: req.body.amount || s.amount
            };
        }
        return s;
    });

    if (!found) {
        return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Updated successfully" });
});


/* ================= DELETE ================= */
app.delete('/customer-services/:service', checkApiKey, (req, res) => {
    const mobile = req.headers.mobile;
    const service = req.params.service;

    if (!mobile) {
        return res.status(400).json({ message: "Mobile header required" });
    }

    const initialLength = services.length;

    services = services.filter(s => 
        !(s.mobile === mobile && s.service === service)
    );

    if (services.length === initialLength) {
        return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Deleted successfully" });
});


/* ================= SERVER ================= */
app.listen(3000, () => {
    console.log("Server running on port 3000 🔥");
});