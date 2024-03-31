import morgan from 'morgan';
import cron from 'node-cron';
import express from 'express';
import cors from 'cors';

import { firebaseAuth } from './src/middleware';
import swaggerDocs from './swagger';
import priceRouter from './src/routers/prices';
import { jobUpdatePrices } from './src/utils';

const port = 3000;

const app = express();

// middleware
app.use(cors());
app.use('/api/*', firebaseAuth);
app.use(morgan('tiny'));

// api routes
app.use('/api/price', priceRouter);

cron.schedule('0 0 * * *', async () => {
  console.log('running a task every 12AM');
  await jobUpdatePrices();
});

app.listen(port, () => {
  console.log(`Price tracker starting on port ${port} !`);
});
swaggerDocs(app, port);
