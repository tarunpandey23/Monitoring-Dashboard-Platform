import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

let requestCount = 0;

app.get('/metrics', (req, res) => {
  requestCount++;
  res.json({
    cpu_usage_percent: Number((20 + Math.random() * 80).toFixed(1)),
    latency_ms: Math.floor(50 + Math.random() * 200),
    error_rate_percent: Number((Math.random() * 5).toFixed(2)),
    total_requests: requestCount,
    timestamp: Math.floor(Date.now() / 1000)
  });
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(8080, () => console.log('Backend running on port 8080'));