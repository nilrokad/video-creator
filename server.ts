import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const SERVICE_ACCOUNT_KEY = {
  "type": "service_account",
  "project_id": "gen-lang-client-0510882267",
  "private_key_id": "b7a4047299116cc84733ba209feeae0fdc29d061",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDfP/Pvq7oQONI/\nqN5wB6VPRCo6WImXqd/swJUKjcB2Mg/00buAvBU3BYjTtzxBRX7IBruXauu3xr4Y\nT6a7dAf9repQSRms0sjhEsbh0WWk23CUgqrSyu+GQl16O3bUysSWlfAJDIFXAP8t\nVGCENtRWH1Mg+VnLWAJEIKE5NxuQZcVhBOUrB3IrV2n6ZKlO4ZoYZ0Z/MFZzG9d6\neKhvpD6USPePXxvKBnsjnxB3KNsIZ0nPsShiBWLV/74N6bWFtWVXDuW34Rqwmz27\nf49Hg8Jpwoa8V01mSA/+woWdONffhR9LW08SJYH/wTpPdhhqdBPM67/6ISFF/nDe\nTkrQCV5XAgMBAAECgf8qU7ggXrXaCC5GccwscWyVn4GRhOJ+e0A3Bpgx8YhX1wmX\nu0iA9Tr9hDBLzdV0GNouXlrKe8I+xR8DJ6Ua+EhlpcfVVIt7bQAt0iPsfTQPZ7F6\nF/bGjrNWXacZGKhg1dgHq3jSZE7yDsfOBIH8Q3J5/heaESfwc/zdjwZXnpGph4BX\nyBoRVYBY6nKU0X3kuXU+KkBRzumz19p/Vu1N1vDQsvb9Z42Xh+s5tIaoj3wgwncH\ndOASSCwUoA838x3y2Ubvj+9PWDWXJi2fWgHU+Iv+jpA6Jaw8MCQLagXo7UCcG58k\nnaknDFH1uam0ERgUPAm9LwHONtEk12bhWi9YgWkCgYEA9Q3AkJuNgolSSpgRyA+C\nC85Dv677TeW4VkAB8ucfm2ThXPhPjzrAQwed5ZxHTxng3JdL0VEfczju8g1aUHX1\nWfwNPlhCOy9DBj6rlbg9aNgA7tpx9/lEfvt63XCTIn6dX67hi7KKPEv6KEQCRB/O\n5DhxVbaJh3ZplC/1r/48BP8CgYEA6TjeKcsBJDOAMosEpjXuQfwJFqsrHUy/BYlX\ndkPpziA2RGxJJQuoIMfwHbRuH39zkvYyd+6RPRwIu6K/DCE4EMogUmOE411EuvzR\nPXN0zDmYwSo8NECGhCmrHxdTfc4oEOs3gGtly0a7F8sL/0ekeHxbIcAhW12LJXMu\n8fk77qkCgYEA51PGFjxhR3quLjCDiKHrF43tMoPSQ2S5sOHXdR9tHNoMTCEzqXfC\niwQjr97pCejZ9iL0tXGpCLIUDndAbHgN1pYzQkk6rHgfA0Qh4cH8Zn6R0uhvcbDj\nUiO/hk6A9q0jjnGeBKvUBruKOHyKzxhfy9zkUA9yoGfNns/vU+Xhbq0CgYBeRZFv\n/VIByxuH0q/Xa7daTsFxu1DbMBmK6GBFOuB4ZIbrE4Zhhhu43HjP2Q4mh0M1ZXUz\nC2kD9aAGEJv/EDJ0fu+fvgCKUzokB2ug1lmg76sycZsSV/7Hz3wPPkOOd9W0ORAf\nRcpI59dan8XCs7fkyAeiVeJl5yMGyU9xmhhCuQKBgDhESjCmxg5oB0L64gVg5pW0\nxeAI/iyg8u2hKVPoFC/jOcntz2tfABwqmVavrJU8kLHIU7h/2Od+7T6xffljADoc\nSP6Ajn1wlQlc3Cd2tKi+g/3g/mJB+2LBe/tEd+gcSq+E0tXWXhFcgsF0IYA3l8qh\nUH8vfV6BKtunC0gnBW6Z\n-----END PRIVATE KEY-----\n",
  "client_email": "googlesheet@gen-lang-client-0510882267.iam.gserviceaccount.com"
};

const SHEET_ID = "1JTIAZm2mR8yMvw3tog_T-YSZmW4h1GIKd6CxNxmJQqM";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google Sheets
  const auth = new JWT({
    email: SERVICE_ACCOUNT_KEY.client_email,
    key: SERVICE_ACCOUNT_KEY.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, auth);

  // API Route to save history
  app.post("/api/history", async (req, res) => {
    try {
      const { idea, prompt } = req.body;
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      
      // The user wants to ignore the first 20 rows.
      // We'll append a row. If the sheet is empty or has fewer than 20 rows, 
      // we might need to handle that, but typically appendRow just adds to the end.
      // To strictly "ignore starting 20 row", we can check current row count.
      
      const rows = await sheet.getRows();
      
      // If the sheet is completely empty (no headers), set them
      if (sheet.headerValues.length === 0) {
        await sheet.setHeaderRow(["Idea", "TextContent", "Prompt", "Analysis", "Timestamp"]);
      }
      
      await sheet.addRow({
        "Idea": idea,
        "TextContent": req.body.textContent || "",
        "Prompt": prompt,
        "Analysis": req.body.analysis || "",
        "Timestamp": new Date().toISOString()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving to sheet:", error);
      res.status(500).json({ error: "Failed to save history" });
    }
  });

  // API Route to fetch history
  app.get("/api/history", async (req, res) => {
    try {
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      
      // Get all rows
      const rows = await sheet.getRows();
      
      if (sheet.headerValues.length === 0) {
        return res.json([]);
      }
      
      // Filter out rows that are in the first 20 (if they exist)
      // Note: getRows returns rows starting from the first data row (usually row 2 if row 1 is header)
      // If the user says "ignore starting 20 row", we should skip them.
      // In google-spreadsheet, rows are 0-indexed relative to data.
      // If headers are on row 1, row 0 in getRows is row 2 in the sheet.
      // So to ignore up to row 20, we skip the first 19 elements of the rows array.
      
      const history = rows.slice(19).map(row => {
        try {
          return {
            idea: row.get("Idea"),
            textContent: row.get("TextContent"),
            prompt: row.get("Prompt"),
            analysis: row.get("Analysis"),
            timestamp: row.get("Timestamp")
          };
        } catch (e) {
          return null;
        }
      }).filter(h => h && h.idea && h.prompt);

      res.json(history.reverse()); // Newest first
    } catch (error) {
      console.error("Error fetching from sheet:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
