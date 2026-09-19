# Lotus Mart · Loyalty & Member Rewards Portal

A unified, responsive React 19 application combining the **Lotus Mart Loyalty Landing Page** and the **Lotus Mart Member Area** design prototypes from the OctaP Credit-as-a-Service loyalty network.

---

## 🌟 Features

### 1. 🛍️ Lotus Mart Loyalty Landing Page
* **Hero Banner & Live Metrics**: 28,400 members, 1.28M Petals issued, 64 stores nationwide, and an interactive live preview card displaying balance, progress bar to Platinum, and verified Sui ledger events.
* **How It Works (`01`)**: 4-step consumer journey explaining barcode checkout, automated point accumulation (10,000 ₫ = 1 Sen / Petal), reward spending, and public Sui digest auditability.
* **Membership Tiers (`02`)**: Complete breakdown of Bronze (1×), Silver (1.25×), Gold (1.5×, active tier highlighted), and Platinum (2×, never-expiring points).
* **Featured Rewards (`03`)**: Direct catalog items from Lotus Mart and partner network (Lumière Cinema, Phố Cà Phê) with one-click interactive redemption.
* **Fast Earn Boosts (`04`)**: Double Points Weekend (2×), Linked Visa / Bank card (+500), Refer a Friend (+300), and Bring Your Own Eco-Bag (+120).
* **Interactive FAQs (`05`)**: Accordion answering common questions regarding blockchain transparency, expiration, zkLogin, and 100% sponsored gas fees.
* **App Download & QR Banner**: Quick download links for App Store and Google Play with simulated QR scanner.

### 2. 💳 Lotus Mart Member Area (Wallet & Portal)
* **Real-time Member Summary**:
  * Available Petals card with progress bar to Platinum (2,480 / 8,000).
  * Expiring points counter (320 Petals expiring on 31 Dec 2026).
  * Rolling 12-month analytics (11,960 Petals, +18% vs previous period).
* **Tab 1: Đổi điểm (Redeem)**:
  * Filter by category: All, Lotus Mart, OctaP Network.
  * Search bar for gifts and vouchers.
  * Interactive **Redeem Modal** that checks balance, calculates remaining points, mints new voucher, and logs the burn event on-chain.
* **Tab 2: Voucher của tôi (My Vouchers)**:
  * Perforated ticket cards for ready, expiring, and used vouchers.
  * One-click code copying and **QR / Barcode Modal** ready for in-store cashier scanning.
* **Tab 3: Lịch sử đổi điểm (Redemption History)**:
  * Tabular audit log of all redeemed rewards, points deducted, timestamps, and clickable Sui tx digests.
* **Tab 4: Lịch sử điểm (Points History)**:
  * Filter by period (7 days, 30 days, 90 days).
  * Feed of supermarket purchases (+52), weekend campaign bonuses (+96), reward burns (-800), and customer service adjustments (+250).
* **Tab 5: Thông tin của tôi (My Profile)**:
  * Editable profile (Name, email, birthdate with birthday bonus perk).
  * zkLogin Google session indicator.
  * Verified Sui on-chain wallet address with copy action.
  * Data export (`.json`) and membership cancellation flows.

### 3. 🎨 Design System & Interactive Controls
* **Bilingual Toggle (VI / EN)**: Instant one-click language switching across the entire landing page and member portal.
* **Brand Color Palette Switcher**: Allows live theming between Lotus Plum (`#9f0261`), Phố Cà Phê (`#8b5a2b`), Sài Gòn Books (`#002b49`), Mekong Fitness (`#88c057`), and Sunrise Hotels (`#ff8c42`).
* **Sui Blockchain Explorer Modal**: Click any transaction digest (`8FkQ7xAm…`, `C3vLp9Rt…`) anywhere on the site to inspect the simulated on-chain proof (checkpoint, sponsored gas, token module, and consensus time).
* **Seamless View Navigation**: Switch between Landing Page and Member Portal instantly via header pills or mobile bar.

---

## 🚀 Running the Project

```bash
cd web-ux-demo/lotus-mart-loyalty
npm install
npm run dev
```

Visit the local development server (typically `http://localhost:5173`).
