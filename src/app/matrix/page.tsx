import type { Metadata } from 'next';
import { MatrixView } from '@/views/matrix/MatrixView';

export const metadata: Metadata = { title: 'සම්පූර්ණ සටහන' };

export default function MatrixPage() {
  return <MatrixView />;
}
