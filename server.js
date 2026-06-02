const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const os = require('os');
const mongoose = require('mongoose');

const providerAuthRoutes = require('./routes/auth/providerAuthRoutes');
const companyAuthRoutes = require('./routes/auth/companyAuthRoutes');
const adminAuthRoutes = require('./routes/auth/adminAuthRoutes');
const providerRoutes = require("./routes/provider/providerRoutes");
const companyRoutes = require("./routes/company/companyRoutes");
const workerRoutes = require("./routes/worker/workerRoutes");
const userRoutes = require("./routes/user/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error(`❌ Error: ${err.message}`));

// --- Helper function to get Local IP ---
function getLocalIp() {
    const interfaces = os.networkInterfaces();

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {

            if (
                iface.family === 'IPv4' &&
                !iface.internal
            ) {
                return iface.address;
            }
        }
    }

    return 'localhost';
}

// --- Routes ---
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server is running!",
        access_from_mobile: `http://${getLocalIp()}:${PORT}`
    });
}); 

app.use("/user-auth", require("./routes/auth/userAuthRoutes"));
app.use("/user-detail", userRoutes);
app.use("/provider-auth", providerAuthRoutes);
app.use("/company-auth", companyAuthRoutes);
app.use("/admin-auth", adminAuthRoutes);

app.use("/providers", providerRoutes);
app.use("/provider-hours", require("./routes/provider/providerHoursRoutes"));

app.use("/companies", companyRoutes);
app.use("/company-hours", require("./routes/company/companyHoursRoutes"));
app.use("/workers", workerRoutes);

app.use("/admin", require("./routes/admin/companyRoutes")); 
app.use("/admin-provider", require("./routes/admin/ProviderRoutes"));
app.use("/categories", require("./routes/category/categoryRoutes"));

// --- Error Handling ---
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).send({
        error: 'Something went wrong!'
    });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {

    const ip = getLocalIp();

    console.log(`\n✅ Server is live!`);
    console.log(`📱 On your Mobile Phone, go to: http://${ip}:${PORT}`);
    console.log(`💻 On this Computer, go to: http://localhost:${PORT}\n`);
}); 