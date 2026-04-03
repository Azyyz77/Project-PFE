'use client';

export default function DirectionBillingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Revenus & Facturation
        </h1>
        <p className="text-gray-600">
          Consultez les données de revenus et facturation (lecture seule)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Revenus totaux
          </h3>
          <p className="mt-2 flex items-baseline">
            <span className="text-5xl font-bold text-gray-900">—</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Factures en attente
          </h3>
          <p className="mt-2 flex items-baseline">
            <span className="text-5xl font-bold text-gray-900">—</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">
          Les données de revenus et facturation seront disponibles prochainement (accès en lecture seule).
        </p>
      </div>
    </div>
  );
}
