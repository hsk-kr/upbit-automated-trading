export type MarketInfo = {
  market: string;
  korean_name: string;
  english_name: string;
};

export type Account = {
  currency: string;
  balance: string;
  locked: string;
  avg_buy_price: string;
  avg_buy_price_modified: boolean;
  unit_currency: string;
};

export type OrderBookUnit = {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
};

export type OrderBook = {
  market: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: OrderBookUnit[];
};

export type Order = {
  uuid: string;
  side: string;
  ord_type: string;
  price: string;
  state: string;
  market: string;
  created_at: string;
  volume: string;
  remaining_volume: string;
  reserved_fee: string;
  remaining_fee: string;
  paid_fee: string;
  locked: string;
  executed_volume: string;
  trades_count: number;
  trades?: {
    market: string;
    uuid: string;
    price: string;
    volume: string;
    funds: string;
    side: string;
  }[];
};

export type OrderParams = {
  market: string;
  side: 'bid' | 'ask';
  volume: string | null;
  price: string | null;
  ordType: 'limit' | 'price' | 'market'; // price for bid, market for ask
};

export type FetchAccountsResponse = Account[];

export type FetchAllMarketResponse = MarketInfo[];

export type FetchOrderBooksResponse = OrderBook[];

export type FetchOrderResponse = Order;

export type FetchOrderListResponse = Order[];

export type CancelOrderResponse = {
  uuid: string;
  side: string;
  ord_type: string;
  price: string;
  state: string;
  market: string;
  created_at: string;
  volume: string;
  remaining_volume: string;
  reserved_fee: string;
  remaining_fee: string;
  paid_fee: string;
  locked: string;
  executed_volume: string;
  trades_count: number;
};

export type OrderResponse = {
  uuid: string;
  side: string;
  ord_type: string;
  price: string;
  avg_price: string;
  state: string;
  market: string;
  created_at: string;
  volume: string;
  remaining_volume: string;
  reserved_fee: string;
  remaining_fee: string;
  paid_fee: string;
  locked: string;
  executed_volume: string;
  trades_count: number;
};
