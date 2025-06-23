// src/routes/api/coinstats-coins/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Redis } from 'ioredis';
import { PRIVATE_REDIS_PASSWORD, PRIVATE_REDIS_URL } from '$env/static/private';

const redis = new Redis(
  process.env.REDIS_URL != ''
    ? (PRIVATE_REDIS_URL as string)
    : 'redis://localhost:6379',
  {
    password: PRIVATE_REDIS_PASSWORD || undefined,
  }
);

type TCoinStatsCoin = {
  pu: number;
  p24: number;
  m: number;
  v: number;
  ic: string;
  s: string;
  n: string;
  c: string;
  i: string;
};

type TransformedCoin = {
  price: number;
  priceChange: number;
  marketCap: number;
  volume: number;
  icon: string;
  symbol: string;
  name: string;
  color: string;
  slug: string;
  is_free: boolean;
};

const COIN_KEY_PREFIX = 'coin:';
const COIN_LIST_KEY = 'coinstats_coin_list';
const CACHE_TTL = 18000; // 5 hours in seconds (5 * 60 * 60)

export const GET: RequestHandler = async () => {
  try {
    // Check if we have a cached coin list
    const cachedCoinList = await redis.get(COIN_LIST_KEY);

    if (cachedCoinList) {
      const coinSlugs: string[] = JSON.parse(cachedCoinList);

      // Use pipeline for efficient batch retrieval
      const pipeline = redis.pipeline();
      coinSlugs.forEach((slug) => {
        pipeline.get(`${COIN_KEY_PREFIX}${slug}`);
      });

      const results = await pipeline.exec();
      const cachedCoins: TransformedCoin[] = [];

      if (results) {
        for (const [err, result] of results) {
          if (!err && result) {
            cachedCoins.push(JSON.parse(result as string));
          }
        }
      }

      // If we got all coins from cache, return them
      if (cachedCoins.length === coinSlugs.length) {
        return json(cachedCoins);
      }
    }

    // Cache miss or partial cache, fetch from API
    console.log('Cache miss or incomplete, fetching from API');
    const coins = await fetch(
      'https://api.coin-stats.com/v4/coins?skip=0&limit=2500'
    )
      .then((response) => response.json())
      .then((data) => (data?.coins as TCoinStatsCoin[]) || [])
      .catch((err) => {
        console.error('API fetch error:', err);
        return [];
      });

    // Transform data
    const transformedCoins: TransformedCoin[] = coins.map((coin) => ({
      price: coin.pu,
      priceChange: coin.p24,
      marketCap: coin.m,
      volume: coin.v,
      icon: coin.ic,
      symbol: coin.s,
      name: coin.n,
      color: coin.c,
      slug: coin.i,
      is_free: coin.i === 'bitcoin' || coin.i === 'ethereum',
    }));

    // Store each coin individually using pipeline for better performance
    const pipeline = redis.pipeline();
    const coinSlugs: string[] = [];

    transformedCoins.forEach((coin) => {
      const key = `${COIN_KEY_PREFIX}${coin.slug}`;
      pipeline.setex(key, CACHE_TTL, JSON.stringify(coin));
      coinSlugs.push(coin.slug);
    });

    // Store the list of coin slugs for faster lookup
    pipeline.setex(COIN_LIST_KEY, CACHE_TTL, JSON.stringify(coinSlugs));

    await pipeline.exec();
    console.log(`Cached ${transformedCoins.length} coins individually`);

    return json(transformedCoins);
  } catch (err) {
    console.error('Endpoint error:', err);
    throw error(500, 'Internal server error');
  }
};
