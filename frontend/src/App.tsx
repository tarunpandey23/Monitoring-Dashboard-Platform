import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import './App.css';

interface Metric {
  cpu_usage_percent: number;
  latency_ms: number;
  error_rate_percent: number;
  total_requests: number;
  timestamp: number;
}

function App() {
  const [data, setData] = useState<Metric[]>([]);
  const [latest, setLatest] = useState<Metric | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        const res = await axios.get(`${backendUrl}/metrics`);
        const point: Metric = res.data;

        setLatest(point);
        setData(prev => [...prev.slice(-29), point]); // keep last 30 points
      } catch (err) {
        console.log("Backend not ready yet...");
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>Live Monitoring Dashboard</h1>

      {latest && (
        <div className="cards">
          <div className="card cpu">
            <h3>CPU Usage</h3>
            <div className="value">{latest.cpu_usage_percent}<span>%</span></div>
          </div>
          <div className="card latency">
            <h3>Latency</h3>
            <div className="value">{latest.latency_ms}<span>ms</span></div>
          </div>
          <div className="card error">
            <h3>Error Rate</h3>
            <div className="value">{latest.error_rate_percent}<span>%</span></div>
          </div>
          <div className="card requests">
            <h3>Total Requests</h3>
            <div className="value">{latest.total_requests}</div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h2>Real-time Metrics Trend</h2>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
            <XAxis dataKey="timestamp" hide />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="cpu_usage_percent" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={false} 
              name="CPU %"
            />
            <Line 
              type="monotone" 
              dataKey="latency_ms" 
              stroke="#f59e0b" 
              strokeWidth={4} 
              dot={false} 
              name="Latency (ms)"
            />
            <Line 
              type="monotone" 
              dataKey="error_rate_percent" 
              stroke="#ef4444" 
              strokeWidth={4} 
              dot={false} 
              name="Error %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer>
        Updates every 10 seconds
      </footer>
    </div>
  );
}

export default App;