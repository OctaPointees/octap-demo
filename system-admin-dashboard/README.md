# OctaP - Testing Guide

This is a **design preview** of OctaP, a loyalty points platform. It runs entirely on your own computer.

> **Good to know:** There is no real server or database. All data is **fake demo data**, and nothing you do here can affect real customers, real money or real systems, so feel free to click anything.

---

## Part 1 - Running the app on your computer

### Step 1: Install Node.js (one time only)

Node.js is the free program that runs this app.

1. Go to **https://nodejs.org**
2. Download the version marked **LTS** (the big green button).
3. Open the downloaded file and click **Next** through the installer, keeping all the default options.
4. Restart your computer when it finishes.

To check that it worked, open a terminal (see Step 2) and type `node -v`, then press **Enter**. You should see a version number such as `v22.x.x`.

### Step 2: Open a terminal in the project folder

A terminal is a window where you type commands.

- **Windows:** Open the project folder in File Explorer. Click the address bar at the top, type `cmd`, and press **Enter**.
- **Mac:** Open the **Terminal** app, type `cd ` (with a space after it), drag the project folder into the window, and press **Enter**.

### Step 3: Install the app (one time only)

Type the following and press **Enter**:

```
npm install
```

Wait until it finishes. This can take a minute or two. Warnings in yellow text are normal and can be ignored.

### Step 4: Start the app

Type the following and press **Enter**:

```
npm run dev
```

After a few seconds you will see a line like this:

```
➜  Local:   http://localhost:5173/
```

### Step 5: Open it in your browser

Open Chrome, Edge or Firefox and go to **http://localhost:5173**. You should see the OctaP sign-in page.

> ⚠️ **Keep the terminal window open while you test.** Closing it stops the app.
> To stop the app when you're done, click the terminal and press **Ctrl + C**.

**Next time**, you only need to repeat **Step 2, Step 4 and Step 5**.

---

## Part 2 - Test accounts

The **password for every account is:** `octap123`

> **Tip:** The sign-in page lists these demo accounts. Click one to fill in the email and password automatically, then click **Sign in**.

| Who you are testing as                            | Email                  | What this account can do                                                                                                            |
| ------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **OctaP administrator** (runs the whole platform) | `admin@octap.io`       | See all merchants, add new merchants, approve or reject rewards, view platform statistics and the security log                      |
| **Store owner** (Lotus Mart)                      | `owner@lotusmart.vn`   | Full access to one store: give points, create campaigns and rewards, manage staff, API keys and AI-agent settings                   |
| **Store cashier** (Lotus Mart)                    | `cashier@lotusmart.vn` | **Limited access.** Can give points to customers and view data, but **cannot** edit campaigns, rewards, settings or developer tools |
| **Store manager** (Phố Cà Phê, a different store) | `manager@phocaphe.vn`  | Manages a different store. Use it to check that one store can't see another store's data                                            |

### Customer (shopper) app

This is a simulated phone app that shoppers would use.

- **Web address:** http://localhost:5173/wallet (or click **"Open the end-user wallet"** on the sign-in page)
- **Phone number:** `0901 234 567` is already filled in and has existing points. You can also type any Vietnamese mobile number, such as `0912 345 678`, to test as a brand-new customer.
- **Verification code:** always `123456`

---

## Part 3 - What to test

Each area below matches a feature in the project scope. Use these as a starting checklist.

### ✅ Signing in (all accounts)

- [ ] Sign in with each account above.
- [ ] Sign in with a wrong password and check that an error message appears.
- [ ] Leave the fields empty and click **Sign in**. You should see "required" messages.
- [ ] Click **Forgot password?** and submit an email address.
- [ ] Click **Log-out** at the bottom left.

### ✅ Administrator - `admin@octap.io`

- [ ] **Dashboard:** switch between 7 / 30 / 90 days. The numbers and charts should update.
- [ ] **Partners → Onboard partner:** create a new store.
  - [ ] Try the token symbol `LTM`. You should get an error because it's already taken.
  - [ ] Change it to something new, such as `ABC`, and submit.
  - [ ] On the new store's page, click **Publish to Sui & activate**. The status should change to **Active**.
- [ ] **Partners → open a store → Suspend:** a reason is required. Then click **Reinstate**.
- [ ] **Vouchers:** approve one reward. Then reject another; rejecting requires a reason.
- [ ] **System Audit:** search and filter. Click a row, then click **Verify against Sui**. Try **Export CSV**.
- [ ] **Search bar** at the top: type a store name, such as "Lotus", and pick a result.

### ✅ Store owner - `owner@lotusmart.vn`

- [ ] **Issue points:** enter a phone number and a bill amount. Check the points preview, then click **Award points** and look at the receipt.
- [ ] **Campaigns → New campaign:** set an end date _before_ the start date and check for an error. Fix it and save.
- [ ] **Campaigns:** use the **⋮** menu to pause, resume or end a campaign.
- [ ] **Rewards → New reward:** submit it. It should show **Pending Review**.
  - [ ] Then sign in as the admin and approve it under **Vouchers**.
- [ ] **Members:** click a member, then add or remove points. A reason is required.
- [ ] **Transactions:** filter by type and by channel.
- [ ] **Developers:**
  - [ ] Create an API key. The full key is shown **only once**.
  - [ ] Revoke a key.
  - [ ] Turn the AI-agent (MCP) tools on and off.
- [ ] **Settings:** change the program settings, invite a teammate, and change a teammate's role.

### ✅ Store cashier - `cashier@lotusmart.vn`

- [ ] The **Developers** menu should **not** appear.
- [ ] **Campaigns** and **Rewards** should be read-only, with no create or edit buttons.
- [ ] **Issue points** should still work.

### ✅ Customer app - `/wallet`

- [ ] Sign in with a phone number and the code `123456`.
- [ ] Try a wrong code, such as `111111`, and check that an error appears.
- [ ] Tap a store card, tap **Pay in store & earn**, enter an amount, and confirm that the points go up.
- [ ] Tap **Redeem** on a reward and confirm. You should receive a voucher code, and the points should go down.
- [ ] Check that the voucher appears under the **Vouchers** tab at the bottom.
- [ ] Under **Discover stores**, tap **Join** on a new store.
- [ ] **Cross-check:** sign in as `owner@lotusmart.vn` and open **Transactions**. The redemption you just made should appear there.

### ✅ Business rules that must always hold

- [ ] Points from one store **cannot** be used at another store.
- [ ] Points **cannot** be exchanged for cash. There is no cash-out option anywhere.
- [ ] A suspended store (**Blue Lagoon Spa**) cannot give out or redeem points.

---

## Part 4 - Handy tools for testers

In the admin or store dashboards, click **Mock API** in the top-right corner to open a testing panel. From there you can:

| Tool                         | What it's for                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------- |
| **Request list**             | See every action the app "sent to the server". Click a line to see the details. |
| **Max latency** slider       | Make the app slower, to check loading spinners and slow-network behaviour.      |
| **Failure injection** slider | Make some actions fail at random, to check that error messages appear properly. |
| **Reset demo data**          | Put all data back to how it started. Use this between test rounds.              |

> Your test data is saved in the browser, so it's still there after you refresh the page. To start completely fresh, use **Reset demo data**, or open the app in a private/incognito window.

---

## Troubleshooting

| Problem                                                 | What to do                                                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `'npm' is not recognized` or `command not found`        | Node.js isn't installed, or you haven't restarted yet. Repeat **Step 1**, then restart your computer.       |
| The browser says **"This site can't be reached"**       | The app isn't running. Go back to the terminal and run `npm run dev` again, and keep that window open.      |
| The terminal shows a different address, such as `:5174` | Another copy is already running. Use the address shown in the terminal, or close the other terminal window. |
| Data looks strange or broken                            | Click **Mock API → Reset demo data**.                                                                       |
| You're stuck on a page                                  | Click **Log-out**, or go to http://localhost:5173 and sign in again.                                        |

When you report a bug, please include: **which account you used**, **the page**, **what you clicked**, **what you expected**, and **what happened**. A screenshot helps too.
