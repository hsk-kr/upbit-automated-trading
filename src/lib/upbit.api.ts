import axiosInstance from './network';
import {
  OrderParams,
  FetchAccountsResponse,
  FetchAllMarketResponse,
  FetchOrderBooksResponse,
  FetchOrderResponse,
  FetchOrderListResponse,
  CancelOrderResponse,
  OrderResponse,
} from './upbit.api.interface';

export const fetchAllMarkets = async (): Promise<FetchAllMarketResponse> => {
  const markets: FetchAllMarketResponse = await axiosInstance.get(
    '/v1/market/all',
    {
      params: {
        isDetails: 'false',
      },
    }
  );

  return markets;
};

export const fetchOrderBooks = async (
  markets: string
): Promise<FetchOrderBooksResponse> => {
  const orderbooks: FetchOrderBooksResponse = await axiosInstance.get(
    '/v1/orderbook',
    {
      params: {
        markets,
      },
    }
  );

  return orderbooks;
};

export const fetchAccounts = async (): Promise<FetchAccountsResponse> => {
  const accounts: FetchAccountsResponse = await axiosInstance.get(
    '/v1/accounts'
  );

  return accounts;
};

export const fetchOrder = async (uuid: string): Promise<FetchOrderResponse> => {
  const order: FetchOrderResponse = await axiosInstance.get('/v1/order', {
    params: {
      uuid,
    },
  });

  return order;
};

export const fetchWaitOrderList = async (): Promise<FetchOrderListResponse> => {
  const orders: FetchOrderListResponse = await axiosInstance.get('/v1/orders');

  return orders;
};

export const cancelOrder = async (
  uuid: string
): Promise<CancelOrderResponse> => {
  const res: CancelOrderResponse = await axiosInstance.delete('v1/order', {
    data: {
      uuid,
    },
  });

  return res;
};

export const order = async ({
  market,
  side,
  volume,
  price,
  ordType,
}: OrderParams): Promise<OrderResponse> => {
  const res: OrderResponse = await axiosInstance.post('/v1/orders', {
    data: {
      market,
      side,
      volume,
      price,
      ord_type: ordType,
    },
  });

  return res;
};
