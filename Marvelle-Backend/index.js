const express = require('express');
const cors = require('cors');
const { env } = require('./src/config/env');
const { errorHandler } = require('./src/middleware/error');
const productsRouter = require('./src/routes/products');

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/products', productsRouter);

// errors
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
