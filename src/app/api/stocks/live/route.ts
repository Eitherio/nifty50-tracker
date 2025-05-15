import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^NSEI', {
      params: {
        interval: '1d',
        range: '5d'
      }
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
  }
}
