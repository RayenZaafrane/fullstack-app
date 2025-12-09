# Fullstack Names App

Simple Express app to collect first and last names and persist them in a local JSON database.

Run locally (PowerShell):
Create a folder in your "Users\yourusename" named "fullstack-app" in "c:\"
```powershell
cd c:\Users\yourusername\fullstack-app
npm install
# Development (auto-restarts)
npm run dev
# Or run once
npm start
```

Endpoints:
- `GET /` - open the web form
- `GET /api/people` - list saved people (JSON)
- `POST /api/people` - save a person (JSON body: `{ "firstName": "...", "lastName": "..." }`)

Data is stored in `data.json` in the project root.
