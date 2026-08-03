# Google Sheets lead delivery

The Worker can send validated quiz fields to a trusted server-side receiver, such as a Google Apps Script Web App. Save the receiver URL only as a Worker secret:

```text
wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL
```

The receiver should validate the JSON request and append it to the required spreadsheet. Do not place a Google credential, spreadsheet ID, or Apps Script URL in browser code.

The demo route leaves sending disabled. To enable a real submission later, set `PUBLIC_DEMO_LEAD_ENDPOINT` to the deployed Worker URL during the site build.
