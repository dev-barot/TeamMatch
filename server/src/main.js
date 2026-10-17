import dotenv from 'dotenv';
import { createApp } from './http/app.js';

dotenv.config();

const port = process.env.PORT || 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`TeamMatch server running on port ${port} (env: ${process.env.NODE_ENV || 'development'})`);
});
