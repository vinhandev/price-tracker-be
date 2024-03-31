import { Router } from 'express';
import {
  getPrices,
  previewPrices,
  updateAUserPrices,
  updatePrices,
} from '../controllers';

const priceRouter = Router();

/** GET Methods */
/**
 * @openapi
 * '/api/price/updatePrices':
 *  get:
 *     tags:
 *     - Price Controller
 *     summary: Update all prices in system
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
priceRouter.route('/updatePrices').get(updatePrices);


/** GET Methods */
/**
 * @openapi
 * '/api/price/updateUserPrices':
 *  get:
 *     tags:
 *     - Price Controller
 *     summary: Update user's prices
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
priceRouter.route('/updateUserPrices').get(updateAUserPrices);


/** GET Methods */
/**
 * @openapi
 * '/api/price/getPrices':
 *  get:
 *     tags:
 *     - Price Controller
 *     summary: Get prices of a user
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
priceRouter.route('/getPrices').get(getPrices);


/** GET Methods */
/**
 * @openapi
 * '/api/price/previewPrices':
 *  get:
 *     tags:
 *     - Price Controller
 *     summary: Fetch a website for preview price
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
priceRouter.route('/previewPrices').get(previewPrices);

export default priceRouter;
