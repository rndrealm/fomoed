export interface SymbolData {
	id: string;
	symbol: string;
	name: string;
	iconUrl: string;
	price: number;
	dayDelta: number;
}

export const symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'BNB', 'MATIC', 'XRP'];
