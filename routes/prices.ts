const firebase = require('firebase-admin');

const db = firebase.firestore();
const priceRef = db.collection('Prices');
const utils = require('../utils/prices.js');
async function updatePrices(request, response) {
  try {
    const snapShots = await priceRef.listDocuments();

    // Use map to create an array of promises
    const promises = snapShots.map(async (snaps) => {
      console.log('snaps', snaps);

      const responseGet = await snaps.get();
      const responseData = await responseGet.data();
      await utils.handleFetch(
        responseData.prices,
        responseData.labels,
        snaps.id
      );

      console.log('success');
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Once all promises are resolved, send the success response
    return response.status(200).send('success');
  } catch (error) {
    return response.status(500).send(error.message);
  }
}

async function updateUserPrices(request, response) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    const auth = await firebase.auth().verifyIdToken(token);

    const snapShots = await priceRef.doc(auth.uid).get();
    const responseData = await snapShots.data();
    await utils.handleFetch(responseData.prices, responseData.labels, auth.uid);
    return response.status(200).send('success');
  } catch (error) {
    return response.status(500).send(error.message);
  }
}

async function getPrices(request, response) {
  console.log('get prices', firebase);
  const token = request.headers.authorization.split(' ')[1];
  const auth = await firebase.auth().verifyIdToken(token);
  console.log('get prices', auth);

  const ref = await priceRef.doc(auth.uid).get();

  if (ref.empty) {
    console.log('No matching documents.');
    return;
  }

  const prices = await ref.data();
  return response.status(200).send(prices);
}

async function previewPrices(request, response) {
  const { websiteLink, beforeCharacters, afterCharacters } = request.query;

  try {
    const responseLinkData = await fetch(websiteLink);
    const data = (await responseLinkData.text())
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .split('=""')
      .join('')
      .split(' ')
      .join('');

    const tmpRemoved =
      data?.split(beforeCharacters.split(' ').join(''))[0] ?? '0';
    const tmpPrice =
      data?.split(beforeCharacters.split(' ').join(''))[1] ?? '0';
    const price1 =
      tmpPrice?.split(afterCharacters.split(' ').join(''))[0] ?? '0';
    const number = utils.convertStringToNumber(price1) ?? 0;

    return response.status(200).send({
      websiteRemoveBeforeCharacters: tmpRemoved,
      websiteSourceCode: tmpPrice,
      websiteRemoveAllCharacters: price1,
      price: number,
    });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}

module.exports = {
  getPrices,
  updatePrices,
  updateUserPrices,
  previewPrices,
};
