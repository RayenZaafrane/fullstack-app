Project: fullstack-app

Overview:
- A small Express-based web app that lets users submit a person record (first name, last name) with an optional amount and currency.
- Includes a right-side currency converter (TND -> USD/EUR) that fetches rates and fills the main form with the converted value and target currency.

Key features:
- Main form (`/`):
  - `First name`, `Last name` (required)
  - `Amount` (optional) — numeric input
  - `Currency` (optional) — select among `TND`, `USD`, `EUR`
  - `Save` button posts to the server and stores the entry.
- Converter (right-side):
  - Input a TND amount, select `USD` or `EUR`, click `Convert`.
  - Converter displays the converted amount and the rate.
  - The converter automatically populates the main form `Amount` and sets the `Currency` to the target currency.
  - Converted amount is written with two decimal places to preserve cents.

API endpoints:
- `GET /api/people` — returns all saved people (JSON array).
- `POST /api/people` — accepts JSON payload { firstName, lastName, amount?, currency? } and saves a person.
- `DELETE /api/people` — deletes all saved people.
- `DELETE /api/people/:id` — deletes a single person by id.

How to run locally:
1. Install dependencies (if needed):
   - `npm install`
2. Start the server:
   - `node index.js`
3. Open your browser:
   - `http://localhost:3000`

Quick test (converter -> form -> save):
1. In the right-side converter set a value (e.g. `1.50`) and a target currency (`USD`).
2. Click `Convert`.
   - Expect to see `convResult` show the conversion.
   - The main form `Amount` (`#entryAmount`) should be filled with the converted value (two decimals).
   - The main form `Currency` (`#entryCurrency`) should be set to the selected target currency.
3. Click `Save` to post the entry. Use `Show Log` to view saved entries and confirm the amount and currency were stored.

Notes and customization:
- The converter fetches rates from `https://open.er-api.com/v6/latest/TND` and caches rates for 10 minutes.
- The input rounding was changed to preserve two decimals so converted values keep cents. If you prefer integer rounding on save, modify the save handler in `public/index.html` to round before posting.
- If you want the converter to avoid triggering blur/change handlers when setting the main form programmatically, we can adjust the code to temporarily disable the event handler during programmatic writes.

Files of interest:
- `public/index.html` — UI and client JS (form, converter, log rendering).
- `index.js` — Express server and API routes.
- `db.js` — local simple persistence (used by API).

Contact / Next steps:
- Tell me if you want `readme.txt` converted to `README.md` (Markdown) or extended with examples/screen captures.
