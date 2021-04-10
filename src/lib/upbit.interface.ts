import { OrderResponse } from './upbit.api.interface';

export interface IMarketData {
  market: string;
  price: number;
  upCnt: number;
  downCnt: number;
  bidHistory:
    | {
        res: OrderResponse;
        amount: number;
      }
    | undefined;
}

export type MarketDataSet = {
  [key: string]: IMarketData;
};
