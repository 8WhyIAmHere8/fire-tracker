const connectDB = require("./db");

const testConnection = async () => { await connectDB(); process.exit(0); };

testConnection();