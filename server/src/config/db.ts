// src/config/db.ts

import dns from "node:dns";
import mongoose from "mongoose";

// ------------------------------------------------------------
// DNS configuration – ensure Node's c‑ares uses Google DNS and prefers IPv4.
// ------------------------------------------------------------
// Set DNS servers to Google public DNS. This must run before any DNS lookup.
// It overrides the OS‑derived list which on this Windows machine includes 127.0.0.1.
// The call is idempotent; subsequent imports will reuse the same settings.
// Prefer IPv4 so that SRV resolution never falls back to IPv6 site‑local addresses.

// NOTE: This is deliberately placed at the top of the module so that any
// subsequent import (e.g., mongoose's SRV resolver) will see the updated list.

dns.setServers(["8.8.8.8", "8.8.4.4"]);
// In Node >=20 the default result order can be forced to IPv4 first.
// This mirrors the behaviour of the older `dns.setDefaultResultOrder('ipv4first')`.
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

/**
 * c-ares to fall back to 127.0.0.1, where no DNS server is running.
 * This makes every SRV lookup (required by mongodb+srv://) fail
 * with ECONNREFUSED.
 *
 * Calling dns.setServers() overrides c-ares's server list globally,
 * and must happen before any DNS resolution (i.e., before mongoose.connect).
 */
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed.");
  } catch (error) {
    console.error(
      "❌ Error closing MongoDB connection:",
      error instanceof Error ? error.message : error
    );
  }
};

export { connectDB, disconnectDB };
