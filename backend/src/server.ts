import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "./types/express-augment";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "../..");
const envFiles = [path.join(rootDir, ".env"), path.join(rootDir, ".env.development")];

/** Load env from project root; `override: true` so values in .env win over stale shell / OS env vars. */
for (const envPath of envFiles) {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error && (result.error as NodeJS.ErrnoException).code !== "ENOENT") {
    console.warn(`[dotenv] ${envPath}:`, result.error.message);
  }
}

function mongoConnectionHint(uri: string): string {
  if (uri.startsWith("mongodb+srv://")) {
    const host = uri.replace(/^mongodb\+srv:\/\//, "").split("/")[0]?.split("@").pop();
    return host ? `mongodb+srv → ${host}` : "mongodb+srv (host not parsed)";
  }
  const after = uri.replace(/^mongodb:\/\//, "");
  const host = after.split("/")[0]?.split("@").pop();
  return host ? `mongodb → ${host}` : uri.slice(0, 40);
}

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      const primary = envFiles[0];
      const exists = fs.existsSync(primary);
      console.error(
        exists
          ? `[env] File exists but MONGO_URI is not set: ${primary}`
          : `[env] Missing file: ${primary}\n` +
              `    Copy .env.example to .env in the project root and set MONGO_URI and JWT_ACCESS_SECRET.`
      );
      throw new Error("MONGO_URI is not set (check .env next to package.json)");
    }

    const uri = process.env.MONGO_URI;
    console.log(`[mongo] Using ${mongoConnectionHint(uri)}`);

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const uri = process.env.MONGO_URI ?? "";

    if (msg.includes("querySrv") || msg.includes("_mongodb._tcp")) {
      console.error(
        "[hint] Atlas uses DNS (SRV) for mongodb+srv://… This error usually means DNS was blocked or refused (VPN, " +
          "corporate/school Wi‑Fi, Pi-hole, or strict firewall). Try: disconnect VPN; switch DNS to 8.8.8.8; or in " +
          "MongoDB Atlas → Connect → Drivers choose the **standard** connection string (mongodb://host1:27017,host2…, " +
          "not mongodb+srv) and paste that as MONGO_URI."
      );
    } else if (msg.includes("127.0.0.1") || msg.includes("ServerSelection") || uri.includes("127.0.0.1")) {
      console.error(
        "[hint] Cannot reach MongoDB on the host in your URI (often localhost). Start MongoDB locally, or set " +
          "MONGO_URI to Atlas. If the log above shows 127.0.0.1 but .env has Atlas, remove MONGO_URI from Windows " +
          "environment variables and duplicate keys in .env.development."
      );
    } else {
      console.error("[hint] Check MONGO_URI in .env (project root, next to package.json) and network access to that host.");
    }
    process.exit(1);
  }
}

start();
