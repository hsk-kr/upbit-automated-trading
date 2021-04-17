import {
  fetchAllMarkets,
  fetchOrderBooks,
  order,
  fetchOrder,
  cancelOrder,
} from './upbit.api';
import {
  MarketInfo,
  FetchOrderBooksResponse,
  OrderBookUnit,
} from './upbit.api.interface';
import { MarketDataSet, IMarketData } from './upbit.interface';

export const MIN_KRW_WHEN_BID = 100000;
export const GOOD_TO_BUY_MIN_PRICE = 10;
export const GOOD_TO_BUY_MAX_PRICE = 10000;

export const isMarketRise = (data: IMarketData) => data.upCnt >= 5;

export const isMarketDeclined = (data: IMarketData) =>
  data.downCnt >= 2 ||
  (data.bidHistory &&
    data.price !== Number(data.bidHistory.res.price) &&
    (Number(data.bidHistory.res.price) - data.price) /
      Number(data.bidHistory.res.price) >=
      0.05);

export const calcBidAmount = (price: number) =>
  Math.floor(MIN_KRW_WHEN_BID / price);

export const isPriceGoodToBuy = (price: number): boolean =>
  price >= GOOD_TO_BUY_MIN_PRICE && price <= GOOD_TO_BUY_MAX_PRICE;

export const calcPriceFromUnits = (units: OrderBookUnit[]): number =>
  (units[0].ask_price + units[0].bid_price) / 2;

export const makeMarketsStringFromDataSet = (dataSet: MarketDataSet): string =>
  Object.keys(dataSet).join(',');

export const generateMarketDataSet = async (): Promise<MarketDataSet> => {
  const dataSet: MarketDataSet = {};

  const markets = await fetchAllMarkets();
  const krwMarkets = markets.filter((market: MarketInfo) =>
    market.market.startsWith('KRW')
  );

  let strMarkets = krwMarkets
    .map((market: MarketInfo) => market.market)
    .join(',');

  const orderBooks: FetchOrderBooksResponse = await fetchOrderBooks(strMarkets);

  // Filter markets depends on price
  for (const orderBook of orderBooks) {
    const { orderbook_units: units } = orderBook;

    if (units.length <= 0) continue;
    const price = calcPriceFromUnits(units);
    if (!isPriceGoodToBuy(price)) continue;

    dataSet[orderBook.market] = {
      market: orderBook.market,
      price,
      upCnt: 0,
      downCnt: 0,
      bidHistory: undefined,
    };
  }

  return dataSet;
};

/**
 * Update upCnt,downCnt and price of each data of dataSet.
 * @param dataSet Market DataSet
 */
export const updateDataSet = async (dataSet: MarketDataSet): Promise<void> => {
  const strMarkets: string = makeMarketsStringFromDataSet(dataSet);

  const orderBooks: FetchOrderBooksResponse = await fetchOrderBooks(strMarkets);

  // Update Each Data of MarketDataSet
  for (const orderBook of orderBooks) {
    const { orderbook_units: units } = orderBook;

    if (units.length <= 0) continue;

    const price = calcPriceFromUnits(units);
    const marketData = dataSet[orderBook.market];

    if (price > marketData.price) {
      marketData.upCnt++;
      marketData.downCnt = 0;
    } else {
      marketData.upCnt = 0;
      marketData.downCnt++;
    }

    marketData.price = price;
  }
};

/**
 * Ask declining markets in you bid markets.
 * @param dataSet Market DataSet
 */
export const askDecliningMarkets = async (dataSet: MarketDataSet) => {
  const dataKeys = Object.keys(dataSet);

  for (const dataKey of dataKeys) {
    const data = dataSet[dataKey];

    // If the market is declined, ask it.
    if (data.bidHistory && isMarketDeclined(data)) {
      console.log(
        `[ASK DECLINED MARKET] market: ${data.bidHistory.res.market} price: ${
          data.price
        } volume: ${data.bidHistory.amount.toString()}`
      );
      console.log(
        `[PROFIT EXPECTATION] bid price:${
          data.bidHistory.res.price
        } ask price:${data.price} diff price: ${
          Number(data.bidHistory.res.price) - data.price
        } `
      );

      //! await order({
      //   market: data.bidHistory.res.market,
      //   side: 'ask',
      //   volume: data.bidHistory.amount.toString(),
      //   ordType: 'market',
      //   price: null,
      // });

      data.bidHistory = undefined;
    }
  }
};

/**
 * Bid rise markets
 * @param dataSet Market DataSet
 */
export const bidRiseMarkets = async (dataSet: MarketDataSet) => {
  const dataKeys = Object.keys(dataSet);

  for (const dataKey of dataKeys) {
    const data = dataSet[dataKey];
    console.log(data);

    // If the market is rise and you didn't bid it yet
    if (isMarketRise(data) && !data.bidHistory) {
      const volume = calcBidAmount(data.price).toString();

      console.log(
        `[BID RISE MARKET] market: ${data.market} price: ${data.price} volume: ${volume}`
      );

      //! Test Code
      data.bidHistory = {
        res: {
          uuid: 'cdd92199-2897-4e14-9448-f923320408ad',
          side: 'bid',
          ord_type: 'limit',
          price: data.price.toString(),
          avg_price: '0.0',
          state: 'wait',
          market: data.market,
          created_at: '2018-04-10T15:42:23+09:00',
          volume: '0.01',
          remaining_volume: '0.01',
          reserved_fee: '0.0015',
          remaining_fee: '0.0015',
          paid_fee: '0.0',
          locked: '1.0015',
          executed_volume: '0.0',
          trades_count: 0,
        },
        amount: Number(volume),
      };

      //! const orderRes = await order({
      //   market: data.market,
      //   side: 'bid',
      //   ordType: 'price',
      //   price: data.price.toString(),
      //   volume,
      // });

      //! data.bidHistory = {
      //   res: orderRes,
      //   amount: 0,
      // };

      // After 8~16 sec, cancel remain order.
      // If it didn't bit, cancel the order.
      //! setTimeout(async () => {
      //   const fetchOrderRes = await fetchOrder(data.bidHistory!.res.uuid);
      //   data.bidHistory!.amount = Number(fetchOrderRes.executed_volume);

      //   if (Number(fetchOrderRes.remaining_volume) > 0) {
      //     console.log(
      //       `[CANCEL REMAIN ORDER] market: ${data.market} remaining volume: ${fetchOrderRes.remaining_volume}`
      //     );
      //     await cancelOrder(fetchOrderRes.uuid);
      //   }
      // }, Math.floor(Math.random() * 9) + 8);
    }
  }
};

export const AreMostMarketsRise = (dataSet: MarketDataSet) => {
  const dataKeys = Object.keys(dataSet);
  let numOfRisedMarkets = 0;

  for (const dataKey of dataKeys) {
    const data = dataSet[dataKey];
    if (data.upCnt > 0) numOfRisedMarkets += 1;
  }

  return numOfRisedMarkets / dataKeys.length >= 0.7;
};
