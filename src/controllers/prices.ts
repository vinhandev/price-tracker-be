import firebase from 'firebase-admin';

import { priceRef } from '../services';
import {
  convertStringToNumber,
  handleFetch,
  handlePreviewPrices,
} from '../utils';
import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';

export async function updatePrices(request, response) {
  try {
    const snapShots = await priceRef.listDocuments();

    // Use map to create an array of promises
    const promises = snapShots.map(async (snaps) => {
      console.log('snaps', snaps);

      const responseGet = await snaps.get();
      const responseData = await responseGet.data();
      await handleFetch(responseData.prices, responseData.labels, snaps.id);

      console.log('success');
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Once all promises are resolved, send the success response
    return response.status(200).send({ message: 'success' });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}

export async function updateAUserPrices(request, response) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    const auth = await firebase.auth().verifyIdToken(token);

    const snapShots = await priceRef.doc(auth.uid).get();
    const responseData = await snapShots.data();
    await handleFetch(responseData.prices, responseData.labels, auth.uid);
    return response.sendStatus(200).send({ message: 'success' });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}

export async function getPrices(request, response) {
  console.log('get prices', firebase);
  const token = request.headers.authorization.split(' ')[1];
  const auth = await firebase.auth().verifyIdToken(token);
  console.log('get prices', auth);

  const ref = await priceRef.doc(auth.uid).get();

  if (!ref.exists) {
    console.log('No matching documents.');
    return;
  }

  const prices = await ref.data();
  return response.status(200).send(prices);
}

export async function previewPrices(request, response) {
  const { websiteLink, selector } = request.query;

  try {
    const { price, rawPrice, logo } = await handlePreviewPrices(
      websiteLink,
      selector,
      true
    );

    return response.status(200).send({
      logo,
      rawPrice,
      price,
    });
  } catch (error) {
    return response.status(500).send(error.message);
  }
}
