import { spawn } from "node:child_process";
import fs from "node:fs";

const artifactDir = "/home/prince/.gemini/antigravity-ide/brain/dd855673-224b-476c-9b8c-ef2b00b7b5ec/scratch";
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

async function run() {
  console.log("1. Authenticating as demo patient (9000000002)...");
  const loginRes = await fetch("http://localhost:4000/api/auth/password-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "9000000002", password: "Demo-65c53e47309b" }),
  });

  const rawCookie = loginRes.headers.get("set-cookie") || "";
  const match = rawCookie.match(/dh_user=([^;]+)/);
  if (!match) {
    throw new Error("Failed to get dh_user cookie from login");
  }
  const dhUserValue = match[1];
  console.log("   -> Authenticated successfully. Extracted session cookie.");

  console.log("2. Launching headless Google Chrome with remote debugging on port 9222...");
  const chrome = spawn("/usr/bin/google-chrome", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    "--user-data-dir=/tmp/chrome-test-profile-" + Date.now(),
    "about:blank"
  ]);

  // Wait for Chrome to listen on port 9222
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const versionRes = await fetch("http://127.0.0.1:9222/json/version");
  const versionData = await versionRes.json();
  const wsUrl = versionData.webSocketDebuggerUrl;
  console.log("   -> Connected to Chrome DevTools:", versionData.Browser);

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    const msgId = id++;
    return new Promise((resolve) => {
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  // Create target page
  const newTarget = await send("Target.createTarget", { url: "about:blank" });
  const targetId = newTarget.result.targetId;
  const attachRes = await send("Target.attachToTarget", { targetId, flatten: true });
  const sessionId = attachRes.result.sessionId;

  function sendSession(method, params = {}) {
    const msgId = id++;
    return new Promise((resolve) => {
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  }

  await sendSession("Page.enable");
  await sendSession("Network.enable");

  // Set the session cookie for both ports 3000 and 4000
  await sendSession("Network.setCookie", {
    name: "dh_user",
    value: dhUserValue,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });

  const captures = [
    { name: "auth_account_overview_1440", url: "http://localhost:3000/account", w: 1440, h: 900 },
    { name: "auth_account_overview_390", url: "http://localhost:3000/account", w: 390, h: 844 },
    { name: "auth_orders_list_1440", url: "http://localhost:3000/account/orders", w: 1440, h: 900 },
    { name: "auth_order_1_delivered_1440", url: "http://localhost:3000/account/orders/1", w: 1440, h: 900 },
    { name: "auth_order_2_shipped_1440", url: "http://localhost:3000/account/orders/2", w: 1440, h: 900 },
    { name: "auth_consultations_1440", url: "http://localhost:3000/account/consultations", w: 1440, h: 900 },
    { name: "auth_prescriptions_1440", url: "http://localhost:3000/account/prescriptions", w: 1440, h: 900 },
    { name: "auth_addresses_1440", url: "http://localhost:3000/account/addresses", w: 1440, h: 900 },
    { name: "order_confirmation_success_1440", url: "http://localhost:3000/thankyou?order=1&payment=success", w: 1440, h: 900 },
    { name: "contact_page_1440", url: "http://localhost:3000/contact", w: 1440, h: 900 },
    { name: "inquiry_page_1440", url: "http://localhost:3000/inquiry", w: 1440, h: 900 },
    { name: "favourites_page_1440", url: "http://localhost:3000/favourites", w: 1440, h: 900 },
  ];

  for (const c of captures) {
    console.log(`   Navigating to ${c.name} (${c.w}x${c.h}): ${c.url}`);
    await sendSession("Emulation.setDeviceMetricsOverride", {
      width: c.w,
      height: c.h,
      deviceScaleFactor: 1,
      mobile: c.w < 600,
    });

    await sendSession("Page.navigate", { url: c.url });
    // Wait for network idle & hydration
    await new Promise((r) => setTimeout(r, 2200));

    const shot = await sendSession("Page.captureScreenshot", { format: "png" });
    if (shot.result?.data) {
      const buffer = Buffer.from(shot.result.data, "base64");
      const outPath = `${artifactDir}/${c.name}.png`;
      fs.writeFileSync(outPath, buffer);
      console.log(`     -> Captured ${outPath} (${buffer.length} bytes)`);
    } else {
      console.error(`     -> Screenshot failed for ${c.name}:`, shot.error);
    }
  }

  ws.close();
  chrome.kill();
  console.log("3. Browser QA execution completed successfully!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("CDP run error:", err);
    process.exit(1);
  });
