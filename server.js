/*
 * SecurePay — backend server (Phase 1: learning, no real payments yet)
 * --------------------------------------------------------------------
 * This file starts a small web server using Express.
 * It does two jobs:
 *   1. Serves your existing frontend (index.html, styles.css, etc.)
 *   2. Exposes one API endpoint (/api/pay) that the frontend calls
 *      when the user clicks "Pay". For now it just validates and
 *      pretends to charge — no real money moves.
 */

// 1) Import the Express library (installed via `npm install express`)
const express = require("express");

// 2) Create the application object
const app = express();

// 3) Choose a port. process.env.PORT lets a host override it later;
//    otherwise we default to 3000.
const PORT = process.env.PORT || 3000;

/* ---------------- Middleware ----------------
 * "Middleware" runs on every request before it reaches our routes.
 */

// Parse incoming JSON bodies so we can read req.body on POST requests.
app.use(express.json());

// Serve every static file in this folder (index.html, styles.css,
// checkout.js, world.png). Visiting "/" will return index.html.
app.use(express.static(__dirname));

/* ---------------- API routes ---------------- */

/*
 * POST /api/pay
 * The frontend sends the payment details here as JSON.
 * IMPORTANT: This is a LEARNING stub. We do NOT store real card
 * numbers and we do NOT charge anything. In Phase 2 (Stripe), the
 * card data won't even reach this server — Stripe handles it.
 */
app.post("/api/pay", (req, res) => {
  const { cardName, amount } = req.body;

  // Basic server-side check. Never trust the frontend alone —
  // always re-validate on the server.
  if (!cardName || typeof cardName !== "string") {
    return res.status(400).json({
      success: false,
      message: "Cardholder name is required.",
    });
  }

  // Pretend to process the payment.
  console.log(`[SecurePay] Simulated charge of $${amount} for ${cardName}`);

  // Make a fake transaction id so the response feels real.
  const transactionId = "TXN-" + Math.floor(100000 + Math.random() * 900000);

  return res.json({
    success: true,
    message: "Payment processed (simulated).",
    transactionId,
  });
});

/* ---------------- Start the server ---------------- */
app.listen(PORT, () => {
  console.log(`SecurePay server running at http://localhost:${PORT}`);
});
