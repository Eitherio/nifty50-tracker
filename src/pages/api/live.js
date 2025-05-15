// 📁 src/pages/api/live.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI', {
      params: {
        interval: '1d',
        range: '1d',
      },
    });

    const data = response.data;

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error("No live data available");
    }

    res.status(200).json(data.chart);
  } catch (error) {
    console.error('API error fetching live data:', error.message);
    res.status(500).json({ error: 'Failed to fetch live data' });
  }
}
