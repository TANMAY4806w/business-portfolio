# Payment Architecture Strategy

**Target:** Final Year Project Defense  
**Topic:** Payment Gateway Selection & Implementation Rationale

Below is the technical defense regarding why our platform utilizes **Stripe Connect (Test Mode)** for its payment infrastructure, why we abandoned Razorpay, and the limitations of building a manual UPI hack.

---

## 1. Why We Avoided Razorpay & Live Gateways
During the architecture phase, we investigated using Razorpay to process real ₹ transactions locally. However, we hit hard regulatory blockers. Under the latest RBI (Reserve Bank of India) guidelines, to activate *Live Mode* on any Indian payment gateway (Razorpay, Cashfree, PayU), you legally must have:
- A fully registered `.com` or `.in` domain.
- Hosted, compliant Privacy Policy and Terms & Conditions pages.
- Business Bank Account or strict individual PAN Card Verification (KYC).

Because our project is currently hosted locally and we do not have a registered corporate domain, passing automated KYC is legally impossible right now. Attempting to use a US Stripe account for live money faces similar issues (requires US SSN or LLC).

## 2. Why Stripe Connect (Test Mode) is Superior
Instead of downgrading the application, we chose to implement **Stripe Connect** in Test Mode. This is the industry standard for marketplace architecture (used by platforms like Fiverr and Uber). 
- **The Tech:** It allows us to demonstrate advanced software engineering. We built a fully automated "Split Payment" mechanism where the platform programmatically routes 90% of the funds to the freelancer's connected bank account, and takes a 10% platform commission.
- **The Proof:** Demonstrating automated Webhooks handling the checkout sessions proves to evaluators that the backend logic is 100% production-ready. The only difference between our system and a real company is flipping a switch from `Test Mode` to `Live Mode` once KYC is approved.

---

## 3. The "Manual UPI QR" Alternative (And Why It Fails)
If the evaluators absolutely *insist* on seeing real money transferred during the demo, our fallback plan is the **Direct UPI QR Hack**. 

**How it works:**
1. We generate a QR code with User B's (The Business) direct UPI ID and the exact price.
2. User A (The Client) scans it with PhonePe and sends real money.
3. User A clicks *"I have paid"*.
4. User B checks their phone, verifies the ₹ dropped in their bank account, and clicks *"Approve Payment"*.

### The Security Loophole (Edge Case)
We heavily advise against using this architecture in production because it completely breaks the "Trustless" nature of our platform. 

*What happens if User A sends the ₹1,000, but User B lies and clicks "I did not receive the money"?*
Because we bypassed the automated Payment Gateway, our backend server `(Node.js)` is completely blind. It has no API or Webhook to verify the bank transaction. User B keeps the money, and User A is left scammed with no automated refund trigger. 

### Conclusion
By using **Stripe Connect Webhooks** (Even in Test mode), our platform mathematically guarantees the payment state, prevents fraud from either party, and automatically processes the commission split securely.
