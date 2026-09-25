import type { Metadata } from 'next';
import { GraphView } from '@/views/graph/GraphView';

export const metadata: Metadata = { title: 'සම්බන්ධතා ජාලය' };

export default function GraphPage() {
  return <GraphView />;
}
