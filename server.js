require("dotenv").config();


const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");

console.log("Loaded ENV Host:", process.env.DB_HOST);

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("Jewellery Live Rate Backend Running...");
});

// start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    
    console.log(`Server running on port ${PORT}`);
});
// Adding Routes
const goldRoutes = require("./src/routes/goldRates");
app.use("/api/gold", goldRoutes);

const silverRoutes = require("./src/routes/silverRates");
app.use("/api/silver", silverRoutes);

const tickerRoutes = require("./src/routes/ticker");
app.use("/api/ticker", tickerRoutes);

const popupRoutes = require("./src/routes/popup");
app.use("/api/popup", popupRoutes);

const bankRoutes = require("./src/routes/bank");
app.use("/api/bank", bankRoutes);

const customMessageRoutes = require("./src/routes/customMessages");
app.use("/api/custom", customMessageRoutes);

const adminRoutes = require("./src/routes/admin");
app.use("/api/admin", adminRoutes);

const notificationRoutes = require("./src/routes/notifications");
app.use("/api/notifications", notificationRoutes);

const clickRoutes = require("./src/routes/clickLogs");
app.use("/api/clicks", clickRoutes);
