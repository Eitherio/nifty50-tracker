// 📁 src/app/page.js
'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const niftyCompanies = [
  "Adani Enterprises.NS", "Adani Ports.NS", "Apollo Hospitals.NS", "Asian Paints.NS", 
  "Axis Bank.NS", "Bajaj Auto.NS", "Bajaj Finance.NS", "Bajaj Finserv.NS", "Bharti Airtel.NS", 
  "Bharat Electronics Limited.NS", "Cipla.NS", "Coal India.NS", "Dr. Reddy's.NS", "ETERNAL LIMITED.NS", 
  "Eicher Motors.NS", "Grasim.NS", "HCL Tech.NS", "HDFC Bank.NS", "HDFC Life.NS", "Hero MotoCorp.NS", 
  "Hindalco.NS", "HINDUNILVR.NS", "ICICI Bank.NS", "ITC.NS", "IndusInd Bank.NS", "Infosys.NS", "Jio Financial Services.NS", 
  "JSW Steel.NS", "Kotak Mahindra Bank.NS", "Larsen & Toubro Limited.NS", "Maruti Suzuki.NS",
  "Mahindra & Mahindra Limited.NS", "Nestle India.NS", "NTPC.NS", "ONGC.NS", "Power Grid.NS",
  "Reliance Industries.NS", "SBI.NS", "SBI Life.NS", "Shriram Finance.NS", "Sun Pharma.NS",
  "Tata Consumer.NS", "Tata Motors.NS", "Tata Steel.NS", "Tata Consultancy Services.NS", 
  "Tech Mahindra.NS", "Titan.NS", "Trent Limited.NS", "UltraTech Cement.NS", "WIPRO.NS"
];

const cellStyle = {
  border: "1px solid #ddd",
  padding: "0.75rem",
  textAlign: "left"
};

export default function Home() {
  const [stockData, setStockData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [sortColumn, setSortColumn] = useState(null);  // 'price' or 'change'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [niftyChangeValue, setNiftyChangeValue] = useState(null); // ₹ change value



const fetchHistoricalData = async () => {
  try {
    let range, interval;

    switch (selectedFilter) {
      case '1m': range = '1d'; interval = '5m'; break;
      case '7d': range = '7d'; interval = '1h'; break;
      case '1mo': range = '1mo'; interval = '1d'; break;
      case '6mo': range = '6mo'; interval = '1d'; break;
      default: range = '1d'; interval = '1m';
    }

    const response = await axios.get(`/api/historical?range=${range}&interval=${interval}`);
    const { timestamp, indicators } = response.data;

    let dates;

if (selectedFilter === '1m') {
  dates = timestamp.map(ts => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
} else if (selectedFilter === '7d') {
  dates = timestamp.map(ts => new Date(ts * 1000).toLocaleDateString());
} else if (selectedFilter === '1mo') {
  dates = timestamp.map(ts => {
    const d = new Date(ts * 1000);
    return d.getDate() % 5 === 0 ? d.toLocaleDateString() : '';
  });
} else if (selectedFilter === '6mo') {
  dates = timestamp.map(ts => {
    const d = new Date(ts * 1000);
    return d.getDate() === 1 ? d.toLocaleDateString('default', { month: 'short' }) : '';
  });
} else {
  dates = timestamp.map(ts => new Date(ts * 1000).toLocaleString());
}

    const prices = indicators.quote[0].close;

    setChartData({
      labels: dates,
      datasets: [
        {
          label: 'Nifty 50',
          data: prices,
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
          fill: false,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
  }
};

const handleSort = (column) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};



const prepareChartData = (historicalData) => {
  const labels = historicalData.map(item => item.date);
  const prices = historicalData.map(item => item.close);

  return {
    labels,
    datasets: [
      {
        label: 'Nifty 50',
        data: prices,
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  };
};


const NiftyChart = ({ chartData }) => {
  return <Line data={chartData} />;
};


const [niftyChange, setNiftyChange] = useState(null);

  const fetchLiveData = async () => {
  try {
    const response = await fetch('/api/live');
    const chart = await response.json();

    const meta = chart.result[0].meta;

    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;

    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    setLiveData(price);
    setNiftyChange(changePercent);
    setNiftyChangeValue(change); // ✅ store ₹ change
  } catch (error) {
    console.error('Error fetching live data:', error.message);
  }
};





const [liveData, setLiveData] = useState(null);
const [selectedFilter, setSelectedFilter] = useState('1m'); // default: 1-minute (today)

useEffect(() => {
  const fetchAll = async () => {
    await fetchLiveData();
    await fetchHistoricalData(); // gets data for current filter
    const res = await fetch("/api/stocks");
    const json = await res.json();
    setStockData(json);
  };
  const handleSort = (column) => {
  if (sortColumn === column) {
    // Toggle direction
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortColumn(column);
    setSortDirection('asc');
  }
};


  fetchAll();
  const interval = setInterval(fetchAll, 60000); // update every 60 seconds
  return () => clearInterval(interval);
}, [selectedFilter]); // ← rerun if filter changes




  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between items-center mb-8 gap-4 px-4">
  <h1 className="text-4xl font-bold text-center sm:text-left">
    Stock Market Tracker
  </h1>

  <input
    type="text"
    placeholder="Search companies"
    className="w-full sm:w-[700px] px-4 py-2 text-base border-2 border-gray-300 rounded-full"
  />
</header>

        
      

      {/* Nifty Index */}
<div style={{ marginBottom: '1.5rem' }}>
  <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '600' }}>
    🔹 Nifty 50 Index
  </h2>
  <div style= {{ margin: '0px 0px 0px 3.5em'}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <div style={{ position: 'relative' }}>
    <p style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    }}>
      ₹{liveData !== null ? liveData.toFixed(2) : 'Loading...'}
    </p>

    {typeof niftyChangeValue === 'number' && (
      <span style={{
        position: 'absolute',
        bottom: '-1.2rem',
        right: '0',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: niftyChange >= 0 ? 'green' : 'red'
      }}>
        {niftyChangeValue >= 0 ? '+' : '-'}{Math.abs(niftyChangeValue).toFixed(2)}
      </span>
    )}
  </div>

  {typeof niftyChange === 'number' && (
    <span style={{
      fontSize: '1rem',
      fontWeight: 'bold',
      color: niftyChange >= 0 ? 'green' : 'red',
    }}>
      {niftyChange >= 0 ? '▲' : '▼'} {Math.abs(niftyChange).toFixed(2)}%
    </span>
  )}
</div>


  </div>
</div>



      {/* Live Chart */}
<section
  style={{
    border: '2px solid gray',
    padding: '2rem',
    marginBottom: '6rem',
    textAlign: 'center',
    height: '450px',       // ⬇️ Reduced from 400 to 320
    width: '92%',          // ⬆️ Slightly wider than before
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
    position: 'relative',
  }}
>
   <div style={{ margin: '0px 0px 2rem 0px', fontWeight: '550', textalign: 'center', }} >
      
  <h2> NIFTY-50 CHART</h2>
  
   </div>
   
  {/* Filter Buttons */}
  <div style={{ marginBottom: '1rem' }}>
    {['1m', '7d', '1mo', '6mo'].map((type) => (
      <button
        key={type}
        onClick={() => setSelectedFilter(type)}
        style={{
          margin: '0 10px',
          padding: '0.4rem 0.5rem',
          backgroundColor: selectedFilter === type ? '#4caf50' : '#eee',
          border: '1px solid #ccc',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        {type === '1m' ? '1 day' : type === '7d' ? '7 Days' : type === '1mo' ? '1 Month' : '6 Months'}
      </button>
    ))}
  </div>

  {chartData.labels.length > 0 ? (
   <div style={{ height: '300px', paddingBottom: '10px' }}>


  <Line
    data={chartData}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
  title: {
    display: true,
    text: selectedFilter === '1m' ? 'Time (HH:MM:SS)' : 'Date',
    color: '#666',
    font: {
      size: 12,
      weight: 'bold',
    }
  },
          grid: {
            display: true,
            color: '#eee'
          }
        },
        y: {
          ticks: {
            color: '#000',
          },
          grid: {
            color: '#ddd',
          }
        }
      }
    }}
  />
</div>



  ) : (
    <p style={{ color: 'gray' }}>Loading chart data...</p>
  )}
</section>





      {/* Table */}
      <section>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "600" }}>Nifty 50 Companies</h2>
        <table style={{
          width: "85%",
          borderCollapse: "collapse",
          marginTop: "1rem",
          border: "5px solid #ccc"
        }}>
          <thead>
            <tr>
              <th style={cellStyle}>Company</th>
              <th style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('price')}>
              Price {sortColumn === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('change')}>
              % Change {sortColumn === 'change' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>

            </tr>
          </thead>
          <tbody>
{[...stockData]
  .sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = sortColumn === 'price' ? a.price : a.change;
    const bVal = sortColumn === 'price' ? b.price : b.change;

    return sortDirection === 'asc'
      ? aVal - bVal
      : bVal - aVal;
  })
  .map((stock, index) => (

              <tr key={index}>
                <td style={cellStyle}>
  <a
    href={`/company/${stock.symbol}`}
    style={{ color: 'black', cursor: 'pointer', }}
  >
    {stock.name || stock.symbol}
  </a>
</td>

                <td style={{ ...cellStyle, position: 'relative', verticalAlign: 'top' }}>
  <div>₹{stock.price}</div>

  {/* Real-time calculated absolute change */}
  {stock.change && !isNaN(stock.change) && stock.price ? (
    <div style={{
      position: 'absolute',
      bottom: '4px',
      right: '6px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      color: stock.change >= 0 ? 'green' : 'red'
    }}>
      {stock.change >= 0 ? '+' : '-'}
      {Math.abs((stock.price * stock.change / 100).toFixed(2))}
    </div>
  ) : null}
</td>

                <td style={{
                  ...cellStyle,
                  color: stock.change >= 0 ? "green" : "red"
                }}>
                  {stock.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
