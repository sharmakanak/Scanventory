## QR Inventory Management System

This project is a simple QR code–based inventory management system built with:

- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React (Vite) with Tailwind CSS
- **QR Codes**: Each item gets an auto-generated QR code that encodes its MongoDB ID.

### Features

- **Add inventory items** with `itemName`, `category`, `quantity`, and `location`.
- **Automatic QR code generation** for each item (QR encodes the item ID).
- **View and manage inventory** in a clean React + Tailwind UI.
- **Increase / decrease stock** from the list or from the "scanned" item panel.
- **Low-stock warning** when quantity \< 5.

---

## 1. Prerequisites

- **Node.js** (LTS version recommended)
- **MongoDB** running locally (or a MongoDB Atlas connection string)
- **VS Code** (recommended editor)

---

## 2. Backend Setup (Express + MongoDB)

1. Open VS Code and **open the `QR` folder**.
2. In a terminal inside VS Code, go to the backend folder:

   ```bash
   cd backend
   ```

3. Create a `.env` file in the `backend` folder with:

   ```bash
   MONGO_URI=mongodb://localhost:27017/qr_inventory
   PORT=5000
   ```

4. Install dependencies (already done if you ran the commands, but safe to repeat):

   ```bash
   npm install
   ```

5. Start the backend in development mode:

   ```bash
   npm run dev
   ```

6. The API will run at `http://localhost:5000`. You can test it by opening:

   ```text
   http://localhost:5000/
   ```

   You should see a small JSON message like `"Inventory API is running"`.

---

## 3. Frontend Setup (React + Tailwind)

1. In a **new terminal** in VS Code, go to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies (already done, but safe to repeat):

   ```bash
   npm install
   ```

3. Start the React dev server:

   ```bash
   npm run dev
   ```

4. Vite will show you a local URL, usually something like:

   ```text
   http://localhost:5173/
   ```

5. Open that URL in your browser. You should see the QR inventory UI.

---

## 4. How to Use the App

- **Add Item**
  - Fill in **Item Name**, **Category**, **Quantity**, and **Location**.
  - Click **“Save Item & Generate QR”**.
  - The new item appears in the table with a QR image.

- **View QR Code**
  - Each row shows a small QR image.
  - This QR encodes the MongoDB `_id` of the item (as a string).

- **Adjust Stock**
  - Use the **-1 / +1** buttons in the table to decrease or increase stock.
  - Quantity can never go below 0.
  - When quantity \< 5, a **“Low stock”** badge appears.

- **Simulated QR Scanning**
  - In a real app you would use a webcam QR scanner library to read the QR and get the item ID.
  - For this beginner-friendly demo, copy an item’s `_id` value (for example, from browser dev tools / API response / MongoDB) and paste it into the field under **“Scan QR (enter or paste Item ID)”**, then click **“Load Item”**.
  - The item details appear in a small card where you can again use **-1 / +1** buttons to update stock.

---

## 5. Folder Structure

- **backend/**
  - `server.js` – Express server + MongoDB connection + route wiring.
  - `src/models/Item.js` – Mongoose model for inventory items.
  - `src/routes/itemRoutes.js` – REST API for creating items, listing items, getting by ID, and updating quantity.

- **frontend/**
  - `index.html` – Vite entry HTML.
  - `src/main.jsx` – React entry point.
  - `src/App.jsx` – Main UI for inventory, QR display, and “scan” panel.
  - `src/index.css` – Tailwind `@import`s.
  - `tailwind.config.js` – Tailwind configuration.

---

## 6. Notes and Extensions

- This project uses **simple REST APIs** and straightforward React state to stay beginner-friendly.
- To add **real webcam-based QR scanning**, you can install a library such as:
  - `react-qr-reader`
  - or `react-qr-scanner`
  and replace the text input in the “Scan QR” section with a live scanner component that calls `setScannedItemId` when a code is detected.
- For production, consider:
  - Adding authentication.
  - Adding pagination or search for large inventories.
  - Deploying the backend and MongoDB to a server/host.


