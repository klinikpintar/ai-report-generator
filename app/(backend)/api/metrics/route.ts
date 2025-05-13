import { getMetrics, metricsContentType } from '@/app/(backend)/utils/metrics';

export async function GET() {
  const metrics = await getMetrics();
  return new Response(metrics, {
    headers: { 'Content-Type': metricsContentType },
  });
}
