// import app from "./app";

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });

import dotenv from "dotenv";
import app from "./app";

// Load environment variables from .env
dotenv.config();

// Read PORT from .env, default to 5000 if not present
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});