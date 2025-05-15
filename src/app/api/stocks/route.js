import yahooFinance from 'yahoo-finance2';

export async function GET(request) {
  const symbols = ["ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS",
    "AXISBANK.NS", "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BHARTIARTL.NS",
    "BEL.NS", "CIPLA.NS", "COALINDIA.NS", "DRREDDY.NS", "EICHERMOT.NS", "ETERNAL.NS", 
    "GRASIM.NS", 
    "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS", "HEROMOTOCO.NS", "HINDALCO.NS", 
    "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS", "INDUSINDBK.NS", "INFY.NS", "JIOFIN.NS", 
    "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS", "MARUTI.NS", "M&M.NS", "NESTLEIND.NS", 
    "NTPC.NS", "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS", "SBIN.NS", "SBILIFE.NS", 
    "SHRIRAMFIN.NS", "SUNPHARMA.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS", 
    "TCS.NS", "TECHM.NS", "TITAN.NS", "TRENT.NS", "ULTRACEMCO.NS", "WIPRO.NS"]; // Add more symbols

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol,
          name: quote.shortName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChangePercent.toFixed(2),
        };
      } catch (err) {
        return { symbol, error: true };
      }
    })
  );

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
