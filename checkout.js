// SecurePay — checkout interactions & client-side validation
(function () {
  "use strict";

  const form = document.getElementById("paymentForm");
  const cardNumber = document.getElementById("cardNumber");
  const cardName = document.getElementById("cardName");
  const expiry = document.getElementById("expiry");
  const cvv = document.getElementById("cvv");
  const cardBrand = document.getElementById("cardBrand");
  const payBtn = document.getElementById("payBtn");
  const successState = document.getElementById("successState");
  const againBtn = document.getElementById("againBtn");

  // ---------- Helpers ----------
  const onlyDigits = (s) => s.replace(/\D/g, "");

  function detectBrand(num) {
    if (/^4/.test(num)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "Amex";
    if (/^6(011|5)/.test(num)) return "Discover";
    return "";
  }

  // Luhn checksum — validates the card number is structurally plausible
  function luhnValid(num) {
    let sum = 0, alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num[i], 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      alt = !alt;
    }
    return num.length >= 13 && sum % 10 === 0;
  }

  function setError(field, message) {
    const el = document.querySelector(`[data-error-for="${field.id}"]`);
    if (el) el.textContent = message || "";
    field.classList.toggle("invalid", Boolean(message));
    return !message;
  }

  // ---------- Live formatting ----------
  cardNumber.addEventListener("input", () => {
    const digits = onlyDigits(cardNumber.value);
    const brand = detectBrand(digits);
    cardBrand.textContent = brand;

    // Amex groups 4-6-5, everyone else 4-4-4-4
    let formatted;
    if (brand === "Amex") {
      formatted = digits.slice(0, 15)
        .replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
          [a, b, c].filter(Boolean).join(" "));
    } else {
      formatted = digits.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    }
    cardNumber.value = formatted;
  });

  expiry.addEventListener("input", () => {
    let v = onlyDigits(expiry.value).slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    expiry.value = v;
  });

  cvv.addEventListener("input", () => {
    cvv.value = onlyDigits(cvv.value).slice(0, 4);
  });

  cardName.addEventListener("input", () => {
    // strip leading/trailing weirdness but keep it forgiving while typing
    cardName.value = cardName.value.replace(/[^a-zA-Z\s.'-]/g, "");
  });

  // ---------- Field validators ----------
  function validateCardNumber() {
    const digits = onlyDigits(cardNumber.value);
    if (!digits) return setError(cardNumber, "Card number is required");
    if (!luhnValid(digits)) return setError(cardNumber, "Enter a valid card number");
    return setError(cardNumber, "");
  }

  function validateName() {
    const v = cardName.value.trim();
    if (!v) return setError(cardName, "Cardholder name is required");
    if (v.length < 2) return setError(cardName, "Enter the full name on the card");
    return setError(cardName, "");
  }

  function validateExpiry() {
    const m = expiry.value.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return setError(expiry, "Use MM/YY format");
    const month = parseInt(m[1], 10);
    const year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return setError(expiry, "Invalid month");

    const now = new Date();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    if (endOfMonth < now) return setError(expiry, "Card has expired");
    return setError(expiry, "");
  }

  function validateCvv() {
    const isAmex = detectBrand(onlyDigits(cardNumber.value)) === "Amex";
    const need = isAmex ? 4 : 3;
    if (cvv.value.length !== need)
      return setError(cvv, `CVV must be ${need} digits`);
    return setError(cvv, "");
  }

  // Validate-on-blur once the user has interacted with a field
  cardNumber.addEventListener("blur", validateCardNumber);
  cardName.addEventListener("blur", validateName);
  expiry.addEventListener("blur", validateExpiry);
  cvv.addEventListener("blur", validateCvv);

  // ---------- Submit ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ok = [
      validateCardNumber(),
      validateName(),
      validateExpiry(),
      validateCvv(),
    ].every(Boolean);

    if (!ok) {
      const firstInvalid = form.querySelector("input.invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate processing (no real charge happens here)
    payBtn.classList.add("loading");
    payBtn.disabled = true;

    setTimeout(() => {
      form.hidden = true;
      payBtn.classList.remove("loading");
      payBtn.disabled = false;
      successState.hidden = false;
    }, 1400);
  });

  // Reset back to the form
  againBtn.addEventListener("click", () => {
    form.reset();
    cardBrand.textContent = "";
    form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
    form.querySelectorAll("input").forEach((el) => el.classList.remove("invalid"));
    successState.hidden = true;
    form.hidden = false;
    cardNumber.focus();
  });
})();
