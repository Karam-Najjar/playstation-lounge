export interface RateSettings {
  rateOneTwoPlayers: number; // SYP per hour for 1-2 players
  rateThreeFourPlayers: number; // SYP per hour for 3-4 players
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface AppSettings {
  rates: RateSettings;
  products: Product[];
  pinCode?: string;
}
