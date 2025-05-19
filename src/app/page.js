// 📁 src/app/page.js
'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

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
  const [niftyChange, setNiftyChange] = useState(null);             // ✅ Define first
  const [niftyChangeValue, setNiftyChangeValue] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('1m');
  const [chartColor, setChartColor] = useState('rgba(75,192,192,1)'); // ✅ Also early
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');


useEffect(() => {
  fetchLiveData(); // Fetch live data first
}, []);

useEffect(() => {
  if (niftyChange !== null) {
    fetchHistoricalData(); // Fetch chart after live data is available
  }
}, [niftyChange, selectedFilter]);

useEffect(() => {
  const fetchStockData = async () => {
    const res = await fetch("/api/stocks");
    const json = await res.json();
    setStockData(json);
  };

  fetchStockData();
  const interval = setInterval(fetchStockData, 60000);
  return () => clearInterval(interval);
}, []);
 // ← rerun if filter changes


const fetchHistoricalData = async () => {
  try {
    let range, interval;

    switch (selectedFilter) {
      case '1m': range = '1d'; interval = '1m'; break;
      case '5d': range = '5d'; interval = '5m'; break;
      case '1mo': range = '1mo'; interval = '5m'; break;
      case '6mo': range = '6mo'; interval = '1h'; break;
      case '1y': range = '1y'; interval = '1h'; break;
      default: range = '1d'; interval = '1m';
    }

    const response = await axios.get(`/api/historical?range=${range}&interval=${interval}`);
    const { timestamp, indicators } = response.data;

    const prices = indicators.quote[0].close;
    const rawDates = timestamp.map(ts => new Date(ts * 1000));

    const dates = rawDates.map(date => {
      if (selectedFilter === '1m') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (selectedFilter === '5d') {
        return date.toLocaleDateString();
      } else if (selectedFilter === '1mo') {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (selectedFilter === '6mo' || selectedFilter === '1y') {
        return date.toLocaleDateString('default', { month: 'short' });
      } else {
        return date.toLocaleString();
      }
    });

    // ✅ Determine color locally
let lineColor;
let fillColor;

if (selectedFilter === '1m') {
  lineColor = niftyChange >= 0 ? 'green' : 'red';
  fillColor = niftyChange >= 0 ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)';
} else {
  const first = prices[0];
  const last = prices[prices.length - 1];
  const isPositive = last >= first;
  lineColor = isPositive ? 'green' : 'red';
  fillColor = isPositive ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)';
}

// ✅ Use those directly
setChartData({
  labels: dates,
  datasets: [
    {
      label: 'Nifty 50',
      data: prices,
      borderColor: lineColor,
      backgroundColor: fillColor,
      borderWidth: 1.5,
      fill: 'origin',
      tension: 0.3,
      pointRadius: 0.3,
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
  return <Line data={chartData} options={options} />;

  
};


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

   
  {/* Filter Buttons */}
  <div style={{ marginBottom: '1rem' }}>
    {['1m', '5d', '1mo', '6mo', '1y'].map((type) => (
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
        {type === '1m' ? '1 day' : type === '5d' ? '5 Days' : type === '1mo' ? '1 Month' : type === '6mo' ? '6 Months' : '1 year'}
      </button>
    ))}
  </div>

  {chartData.labels.length > 0 ? (
   <div className="h-[400px] sm:h-[500px]" >


   {/* Live Chart */}
  <section className="border border-gray-300 rounded-md p-4 mb-16 px-0 py-6 w-full ">
  <h2 className="text-xl font- text-center mb-4">NIFTY-50 CHART</h2>
  <div className="w-full h-[300px] sm:h-[300px] md:h-[350px]">
  <Line
  data={chartData}
  options={{
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          callback: function (value, index, ticks) {
  const label = this.getLabelForValue(value);

  if (selectedFilter === '1m') {
    return label.slice(0, 5); // "HH:MM"
  }

  if (selectedFilter === '5d' || selectedFilter === '1mo') {
    const date = new Date(label);
    if (!isNaN(date)) {
      return `${date.getDate()}/${date.getMonth() + 1}`; // e.g. 12/5
    }
  }

  if (selectedFilter === '6mo' || selectedFilter === '1y') {
    const date = new Date(label);
    if (!isNaN(date)) {
      return date.toLocaleDateString('default', { month: 'short' }); // "Jan", "Feb"
    }
  }

  return label;
},


          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          color: '#000'
        },
        grid: {
          color: '#eee'
        }
      },
      y: {
        ticks: {
          color: '#000'
        },
        grid: {
          color: '#ddd'
        }
      }
    }
  }}
/>
</div>
</section>
</div>



  ) : (
    <p style={{ color: 'gray' }}>Loading chart data...</p>
  )}





 <section className="mt-8">
  <h2 className="text-xl font-semibold mt-0 mb-4">Nifty 50 Companies</h2>

  <div className="overflow-x-auto w-full">
    <table className="min-w-full border-[2px] border-black border-collapse rounded-md text-sm sm:text-base table-auto">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 border-[2px] border-black p-3">Company</th>
          <th className="px-4 py-2 cursor-pointer border-[2px] border-black p-3" onClick={() => handleSort('price')}>
            Price {sortColumn === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th className="px-4 py-2 cursor-pointer border-[2px] border-black p-3" onClick={() => handleSort('change')}>
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
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          })
          .map((stock, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border whitespace-nowrap">
                <a
                  href={`/company/${stock.symbol}`}
                  className="text-grey hover:underline"
                >
                  {stock.name || stock.symbol}
                </a>
              </td>
              <td className="relative text-center px-4 py-3 border align-middle">
  {/* Price centered */}
  <span className="text-base font-medium block">₹{stock.price}</span>

  {/* Small change bottom-right */}
  {stock.change && !isNaN(stock.change) && stock.price && (
    <span
      className={`absolute bottom-0.5 right-1 text-xs font-semibold ${
        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {stock.change >= 0 ? '+' : '-'}
      {Math.abs((stock.price * stock.change / 100).toFixed(2))}
    </span>
  )}
</td>


              <td
                className={`px-4 py-2 border relative text-center align-middle ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}
              >
                {stock.change}%
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</section>
</main>
  );
}
