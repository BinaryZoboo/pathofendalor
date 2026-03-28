export type AuctionHouseSale = {
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

export type AuctionHouseSalesResponse = {
  available: boolean;
  count: number;
  updatedAt: string;
  sales: AuctionHouseSale[];
};

const API_PATH = "/api/auction-house-sales";

export async function fetchAuctionHouseSales(): Promise<AuctionHouseSalesResponse> {
  const response = await fetch(API_PATH, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Auction house API failed with ${response.status}`);
  }

  return (await response.json()) as AuctionHouseSalesResponse;
}
