'use client';

import { Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClientOrdersPage() {
  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Mes Commandes de Réparation</h1>
        
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">Aucune commande de réparation</p>
          <Link href="/client/appointments/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <ArrowRight className="w-4 h-4" />
              Réserver un rendez-vous
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
