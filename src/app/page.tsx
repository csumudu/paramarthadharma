import type { Metadata } from 'next';
import { ExplorerView } from '@/views/explorer/ExplorerView';

// Root page: the layout's title template does not apply at the same segment, so spell it out.
export const metadata: Metadata = { title: { absolute: 'පරමාර්ථ ධර්ම · අභිධර්මයේ සිත් 89 හා සම්බන්ධතා' } };

export default function Home() {
  return <ExplorerView />;
}
