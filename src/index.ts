import {
  generateMarketDataSet,
  updateDataSet,
  askDecliningMarkets,
  AreMostMarketsRise,
  bidRiseMarkets,
  MIN_KRW_WHEN_BID,
} from './lib/upbit-bot';
import { fetchAccounts } from './lib/upbit.api';

const CHECK_DELAY = 1000 * 60 * 1;
let dataSet = {};
let krw = 0;

const bot = async () => {
  try {
    await updateDataSet(dataSet);
    await askDecliningMarkets(dataSet);

    const accounts = await fetchAccounts();
    const krwAccount = accounts.filter((account) => account.currency === 'KRW');

    if (krwAccount.length === 0) return;

    krw = Number(krwAccount[0].balance);

    //if (krw >= MIN_KRW_WHEN_BID && AreMostMarketsRise(dataSet)) {
    if (AreMostMarketsRise(dataSet)) {
      console.log('[EXECUTE] Most markets are rise.');
      await bidRiseMarkets(dataSet);
    } else {
      console.log('[PASS] Most markets are not rise.');
    }
  } catch (err) {
    console.error(err);
  }
};

const printDataSet = async () => {
  console.log('=== [PRINT DATASET] ===');
  console.dir(dataSet);
  console.log('=== [END PRINTING DATASET] ===');
};

const main = async () => {
  dataSet = await generateMarketDataSet();
  console.log('[START] DataSet has been generated.');

  setInterval(bot, CHECK_DELAY);
  setInterval(printDataSet, 1000 * 60 * 30);
};

const test = async () => {
  const accounts = await fetchAccounts();
  console.log(accounts);
};

main();
