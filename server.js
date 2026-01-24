require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");

console.log("Loaded ENV Host:", process.env.DB_HOST);

const app = express();

app.use(cors());
app.use(express.json());

// Root Test Route
app.get("/", (req, res) => {
    res.send("Jewellery Live Rate Backend Running...");
});

// PORT SETUP
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/* ---------------- ROUTES ---------------- */

const goldRoutes = require("./src/routes/goldRates");
app.use("/api/gold", goldRoutes);

const silverRoutes = require("./src/routes/silverRates");
app.use("/api/silver", silverRoutes);

const popupRoutes = require("./src/routes/popup");
app.use("/api/popup", popupRoutes);

const bankRoutes = require("./src/routes/bank");
app.use("/api/bank", bankRoutes);

const customMessageRoutes = require("./src/routes/customMessages");
app.use("/api/custom", customMessageRoutes);

const adminRoutes = require("./src/routes/admin");
console.log("ADMIN ROUTES:", adminRoutes)

app.use('/admin', adminRoutes.default)

const notificationRoutes = require("./src/routes/notifications");
app.use("/api/notifications", notificationRoutes);

const clickRoutes = require("./src/routes/clickLogs");
app.use("/api/clicks", clickRoutes);

const mmtcRoutes = require("./src/routes/mmtc");
app.use("/api/mmtc", mmtcRoutes);

// Keep only one — final correct route:
const tickerRoutes = require("./src/routes/ticker");
app.use("/api/ticker", tickerRoutes);

// 🆕 Unlimited Live Rates Endpoint
const unlimitedLiveRoutes = require("./src/routes/unlimitedLive");
app.use("/api/live", unlimitedLiveRoutes);


const mcxRoutes = require("./src/routes/mcx");
app.use("/api/mcx", mcxRoutes);
