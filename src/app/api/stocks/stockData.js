// pages/api/stockData.js
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  try {
    const data = await yahooFinance.historical({
      symbol: 'AAPL',
      from: '2020-01-01',
      to: '2021-01-01',
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
