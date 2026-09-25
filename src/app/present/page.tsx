import type { Metadata } from 'next';
import { PresentView } from '@/present/PresentView';

export const metadata: Metadata = { title: 'ඉදිරිපත් කිරීම' };

export default function PresentPage() {
  return <PresentView />;
}
