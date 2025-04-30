import { PUBLIC_CIGNALS_WS_URL } from '$env/static/public';
import type { CignalsTimestep } from '$lib/types';

// Represents a trade action (buy or sell)
type TradeAction = 'buy' | 'sell';

// Represents a single trade entry
interface TradeEntry {
	timestamp: number; // Epoch timestamp in milliseconds
	action: TradeAction;
	size: number; // Trade size (volume)
	price: number; // Trade price
	orderId: number;
}

// Represents buy/sell order book levels
interface OrderBook {
	[price: string]: number; // Price level mapped to size
}

// Represents market data for a specific timestamp
interface MarketData {
	close: number;
	delta: number;
	first: TradeEntry;
	high: number;
	last: TradeEntry;
	low: number;
	open: number;
	pv: number; // Possibly price * volume or some aggregate metric
	sum_size_sq: number; // Sum of squared trade sizes
	trades: number; // Number of trades (always 1 in the provided data)
	volume: number;
	buy?: OrderBook; // Buy-side order book (optional)
	sell?: OrderBook; // Sell-side order book (optional)
}

// Represents the full tick message format
type MessageId = '7' | '9';

interface CignalsMessage {
	0: MessageId;
	1: null; // Placeholder, currently always null
	2: string; // Asset identifier (e.g., "tick:binance_futures.btc.usdt.perp" or "o:272")
	3: string; // Message type ("ticks" or "u")
	4: {
		data: FootprintUpdateMsgData | OrderBookUpdateMsgData;
	};
}

export interface FootprintUpdateData {
	price: number;
	volume: number;
	side: TradeAction;
}

export interface AccUpdateData {
	n: number;
	size_sq: number;
	vol: number;
}

// Represents the data structure for message with ID 7
export interface FootprintUpdateMsgData {
	[timestamp: string]: MarketData;
}

type LiveOrderBookSideData = {
	[price: string]: [number, number, number] | null;
};

export type OrderBookUpdateDataItem = {
	price: number;
	placedOrders: number;
	smallOne: number;
	smallTwo: number;
	side: TradeAction;
};
export type OrderBookUpdateData = OrderBookUpdateDataItem[];

// Represents the data structure for message with ID 9
export interface OrderBookUpdateMsgData {
	[side: string]: LiveOrderBookSideData;
}

export interface LiveDataProviderOptions {
	instrumentId: number;
	instrumentLabel: string;
	priceStep: number;
	timeInterval: CignalsTimestep;

	onNewPrice: (price: number) => void;
	onFootprintUpdate: (data: FootprintUpdateData) => void;
	onOrderBookUpdate: (data: OrderBookUpdateData) => void;
	onAccUpdate: (data: AccUpdateData) => void;
	onSocketConnecting?: () => void;
	onSocketConnected?: () => void;
	onSocketReconnected?: () => void;
	onSocketDisconnected?: () => void;
}

const wsEventTypes = ['cignals_connection_open', 'cignals_message'] as const;
type WsEventType = (typeof wsEventTypes)[number];

interface WsMessage {
	event: WsEventType;
	data?: string; // CignalsMessage like
}

export class CignalsChartLiveDataProvider {
	#options: LiveDataProviderOptions;
	#ws: WebSocket | null = null;

	/**
	 * If true and connection is closed from either side, reconnect will be initiated.
	 */
	#enableReconnect = false;

	/**
	 * Determines whether the onSocketReconnect function should be fired when connection is estabilished. This is used for example for full data refresh, as some of the footprint data might have been missed.
	 */
	#connectTriggeredFromReconnect = false;

	#isConnecting = false;

	constructor(options: LiveDataProviderOptions) {
		this.#options = options;
	}

	connectWs() {
		if (this.#isConnecting) {
			console.debug('Socket is already connecting...');
			return;
		}

		if (this.#ws) {
			this.destroyWs();
		}

		console.info("Connecting to Cignals' WebSocket...");

		const wsUrl = PUBLIC_CIGNALS_WS_URL;

		this.#enableReconnect = true;
		this.#options.onSocketConnecting?.();

		this.#ws = new WebSocket(wsUrl);

		this.#ws.onopen = this.#handleWsOpen.bind(this);
		this.#ws.onmessage = this.#handleMessasge.bind(this);
		this.#ws.onclose = this.#handleWsClose.bind(this);
		this.#ws.onerror = this.#handleWsError.bind(this);
	}

	destroyWs() {
		this.#enableReconnect = false;

		this.#ws?.close();
		this.#ws = null;
	}

	get isConnected(): boolean {
		return this.#ws?.readyState === WebSocket.OPEN;
	}

	#handleWsOpen() {
		console.debug('WebSocket connection opened');

		this.#isConnecting = false;

		if (this.#connectTriggeredFromReconnect) {
			this.#options.onSocketReconnected?.();
			this.#connectTriggeredFromReconnect = false;
		}
	}

	#handleMessasge(event: MessageEvent) {
		const msg = JSON.parse(event.data) as WsMessage;
		const eventType = msg.event;

		if (eventType === 'cignals_connection_open') {
			console.info('Cignals connection opened');

			this.#handleCignalsConnectionOpen();
		} else if (eventType === 'cignals_message') {
			this.#handleCignalsMessage(msg.data!);
		}
	}

	#handleCignalsMessage(message: string) {
		const data = JSON.parse(message) as CignalsMessage;

		if (data[0] === '7') {
			this.#handleTickMessage(data);
		} else if (data[0] === '9') {
			this.#handleOrderBookMessage(data);
		}
	}

	#handleCignalsConnectionOpen() {
		console.log('Cignals connection opened');

		this.#sendSubscribeMessage();
		this.#sendOrderBookSubscribeMessage();
		this.#options.onSocketConnected?.();
	}

	#handleWsClose() {
		console.log('WebSocket connection closed');
		this.#options.onSocketDisconnected?.();

		if (this.#enableReconnect) {
			this.destroyWs();
			this.#connectTriggeredFromReconnect = true;
			this.connectWs();
		}
	}

	#handleWsError(error: Event) {
		this.#isConnecting = false;

		console.error('WebSocket error:', error);
	}

	#warn() {
		console.warn('[LiveDataProvider] Error');
	}

	// --------- Message handlers ----------
	#handleTickMessage(message: any) {
		const data: FootprintUpdateMsgData = message[4].data;

		if (!data) {
			return;
		}

		const lastTsStr = Object.keys(data).sort().pop();

		if (!lastTsStr) {
			this.#warn();
			return;
		}

		const lastTsData: MarketData = data[lastTsStr];

		const currentPrice = lastTsData.close;

		this.#options.onNewPrice(currentPrice);

		for (const [side, sideStr] of [
			[lastTsData.buy, 'buy'],
			[lastTsData.sell, 'sell']
		]) {
			if (!side) {
				continue;
			}

			for (const [priceStr, volume] of Object.entries(side)) {
				const price = parseFloat(priceStr);

				this.#options.onFootprintUpdate({
					volume,
					price,
					side: sideStr as TradeAction
				});
			}
		}

		this.#options.onAccUpdate({
			n: lastTsData.trades,
			size_sq: lastTsData.sum_size_sq,
			vol: lastTsData.volume
		});
	}

	#handleOrderBookMessage(message: any) {
		const data = message[4].data as OrderBookUpdateMsgData;

		if (!data) {
			return;
		}

		const orderBookUpdateData: OrderBookUpdateData = [];

		for (const [side, sideData] of Object.entries(data)) {
			const sideAction = side as TradeAction;

			for (const entry of Object.entries(sideData)) {
				const [priceStr, value] = entry;

				const price = parseFloat(priceStr);

				if (!value) {
					orderBookUpdateData.push({
						price,
						placedOrders: 0,
						smallOne: 0,
						smallTwo: 0,
						side: sideAction
					});
					continue;
				}

				const [placedOrders, replaceOne, replaceTwo] = value;

				orderBookUpdateData.push({
					price,
					placedOrders,
					smallOne: replaceOne,
					smallTwo: replaceTwo,
					side: sideAction
				});
			}
		}

		this.#options.onOrderBookUpdate(orderBookUpdateData);
	}

	// --------- Message senders ----------
	#sendSubscribeMessage() {
		const message = [
			'7',
			'7',
			`tick:${this.#options.instrumentLabel}`,
			'phx_join',
			{
				rate: 30,
				price_tick_size: this.#options.priceStep,
				time_tick_size: this.#options.timeInterval
			}
		];

		const messageStr = JSON.stringify(message);

		this.#ws?.send(messageStr);
	}

	#sendOrderBookSubscribeMessage() {
		const message = [
			'9',
			'9',
			'o:' + this.#options.instrumentId,
			'phx_join',
			{ rate: 30, price_tick_size: this.#options.priceStep }
		];

		const messageStr = JSON.stringify(message);

		this.#ws?.send(messageStr);
	}
}
