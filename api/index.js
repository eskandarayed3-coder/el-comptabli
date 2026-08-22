// Vercel's Node.js runtime invokes this Express instance for every /api route.
// The application validates its production configuration at import time, so a
// deployment cannot accidentally serve unprotected local-only data.
export { default } from '../server/index.js';
