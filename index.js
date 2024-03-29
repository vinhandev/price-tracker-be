const express = require('express');
const cors = require('cors');
const authMiddleware = require('./authMiddleware');
const prices = require('./routes/prices.ts');
const cron = require('node-cron');

const app = express();
app.use(cors());

app.use('/', authMiddleware);

app.get('/prices', prices.getPrices);
app.get('/updatePrices', prices.updateUserPrices);
app.get('/previewPrices', prices.previewPrices);

cron.schedule('0 0 * * *', async () => {
  console.log('running a task every 12AM');
  await prices.updatePrices();
});

app.listen(3000, () => {
  console.log('listening on port 4000');
});
