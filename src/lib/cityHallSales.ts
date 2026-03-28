export type CityHallSale = {
  id: string;
  seller: string;
  itemName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  currency: string;
  listedAt: string | null;
  expiresAt: string | null;
  enchantments: string[];
};

export type CityHallSalesResponse = {
  available: boolean;
  count: number;
  updatedAt: string;
  sales: CityHallSale[];
};

const API_PATH = "/api/cityhall-sales";

export async function fetchCityHallSales(): Promise<CityHallSalesResponse> {
  const response = await fetch(API_PATH, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`City hall API failed with ${response.status}`);
  }

  return (await response.json()) as CityHallSalesResponse;
}
