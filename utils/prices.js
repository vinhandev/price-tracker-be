const firebase = require('firebase-admin');

const db = firebase.firestore();
const priceRef = db.collection('Prices');

const isSameDay = (date1, date2) => {
  const isSameDayTime = date1.getDate() === date2.getDate();
  const isSameMonth = date1.getMonth() === date2.getMonth();
  const isSameYear = date1.getFullYear() === date2.getFullYear();
  return isSameDayTime && isSameMonth && isSameYear;
};

function convertStringToNumber(str) {
  const numericStr = str.replace(/[^0-9]/g, '');

  const number = parseFloat(numericStr);

  return isNaN(number) ? null : number;
}

const updateFirebasePrices = async (uid, props) => {
  await priceRef.doc(uid).set(props);
};
async function handleFetch(paramPrices, paramLabels, uid) {
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
          const response = await fetch(element.link);
          const data = (await response.text())
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .split('=""')
            .join('')
            .split(' ')
            .join('');

          const price =
            data
              .split(element.first.split(' ').join(''))[1]
              ?.split(element.last.split(' ').join(''))[0] ?? '0';
          const number = convertStringToNumber(price);
          if (number !== null && number !== 0) {
            if (!element?.data) {
              element.data = [
                {
                  price: number,
                  date: lastUpdate,
                },
              ];
            } else {
              if (isToday) {
                element.data.pop();
              }

              element.data?.push({
                price: number,
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

module.exports = {
  handleFetch,
  convertStringToNumber
};
