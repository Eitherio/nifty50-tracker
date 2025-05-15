import axios from 'axios';

export default async function handler(req, res) {
  const { range = '1d', interval = '1m' } = req.query;

  try {
    const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI', {
      params: {
        range,      // e.g. 1d, 5d, 1mo, 6mo
        interval,   // e.g. 1m, 1h, 1d
      },
    });

    const data = response.data;

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error("No chart data available");
    }

    res.status(200).json(data.chart.result[0]);
  } catch (error) {
    console.error('API error fetching historical data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

