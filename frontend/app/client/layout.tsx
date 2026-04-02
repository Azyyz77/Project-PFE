import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Dashboard | STA Chery',
  description: 'Gérez vos véhicules et rendez-vous',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
