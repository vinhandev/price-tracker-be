import { CheerioAPI, load } from 'cheerio';
import { priceRef } from '../services';
import axios from 'axios';
import puppeteer from 'puppeteer';

const isSameDay = (date1, date2) => {
  const isSameDayTime = date1.getDate() === date2.getDate();
  const isSameMonth = date1.getMonth() === date2.getMonth();
  const isSameYear = date1.getFullYear() === date2.getFullYear();
  return isSameDayTime && isSameMonth && isSameYear;
};

export function convertStringToNumber(str) {
  const numericStr = str.replace(/[^0-9]/g, '');

  const number = parseFloat(numericStr);

  return isNaN(number) ? null : number;
}

export async function jobUpdatePrices() {
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
    return true;
  } catch (error) {
    return false;
  }
}
export const updateFirebasePrices = async (uid, props) => {
  await priceRef.doc(uid).set(props);
};

export async function handlePreviewPrices(
  websiteLink: string,
  selector: string,
  isUpdateImage: boolean = false
) {
  try {
    const responseLinkData = await axios.get(websiteLink);

    const $ = load(responseLinkData.data);
    let rawPrice = $(selector, '').text();

    console.log('rawPrice', rawPrice.split('\n')[0]);

    const price = convertStringToNumber(rawPrice || '') ?? 0;

    if (isUpdateImage) {
      const logo = getFavicon(websiteLink, $);
      return {
        logo,
        rawPrice,
        price,
      };
    }

    return {
      rawPrice,
      price,
    };
  } catch (error) {
    return null;
  }
}

function getFavicon(url: string, $: CheerioAPI) {
  try {
    // Find the favicon link in the <head> section
    const faviconLink =
      $('head').find('link[rel="icon"]').attr('href') ||
      $('head').find('link[rel="shortcut icon"]').attr('href');

    // If no favicon link is found, return null
    if (!faviconLink) {
      return 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + url;
    }

    // If the favicon link is a relative path, prepend the domain
    if (!faviconLink.startsWith('http')) {
      const domain = new URL(url).origin;
      return domain + faviconLink;
    }

    return faviconLink;
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return null;
  }
}
export async function handleFetch(paramPrices, paramLabels, uid) {
  const lastUpdate = new Date().getTime();
  let isHaveRecord = false;

  try {
    if (paramPrices?.length === 0) throw new Error('Prices not found');
    const lastDayLabels = paramLabels[paramLabels.length - 1];
    const isToday = isSameDay(new Date(lastDayLabels), new Date(lastUpdate));
    for (let index = 0; index < paramPrices.length; index++) {
      const group = paramPrices[index];
      for (let i = 0; i < group?.data.length; i++) {
        const element = paramPrices[index].data[i];
        try {
          console.log(element.link);
          const { price } = await handlePreviewPrices(
            element.link,
            element.selector,
            false
          );
          if (price !== null && price !== 0) {
            if (!element?.data) {
              element.data = [
                {
                  price,
                  date: lastUpdate,
                },
              ];
            } else {
              if (isToday) {
                element.data.pop();
              }

              element.data?.push({
                price,
                date: lastUpdate,
              });
            }
            if (!isHaveRecord) {
              isHaveRecord = true;
            }
          } else {
            throw new Error('no price');
          }
        } catch (error) {
          if (!isToday) {
            element.data?.push({
              price: -1,
              date: lastUpdate,
            });
          }
        }
      }
    }
    if (isHaveRecord) {
      if (isToday) {
        paramLabels.pop();
      }
      paramLabels.push(lastUpdate);

      await updateFirebasePrices(uid, {
        prices: paramPrices,
        labels: paramLabels,
        lastUpdate,
      });
    } else {
      throw new Error('No record to fetch');
    }
  } catch (error) {
    return error.message;
  }
}
