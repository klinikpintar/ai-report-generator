import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from 'prom-client';

const register = new Registry();

// ⏱️ Default system metrics
collectDefaultMetrics({ register });

// 📈 Counter: total permintaan API
export const apiRequests = new Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['route', 'method'],
  registers: [register],
});

// 📈 Counter: total permintaan API sukses
export const totalRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests received (global)',
  labelNames: ['method'],
  registers: [register],
});

// ⏱ Histogram: waktu respon tiap endpoint
export const apiResponseDuration = new Histogram({
  name: 'api_response_duration_seconds',
  help: 'Duration of API responses in seconds',
  labelNames: ['route', 'method'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const apiErrorResponses = new Counter({
  name: 'api_error_responses_total',
  help: 'Total API errors thrown',
  labelNames: ['status', 'message'],
  registers: [register],
});

export async function getMetrics(): Promise<string> {
  return await register.metrics();
}
export const metricsContentType = register.contentType;
