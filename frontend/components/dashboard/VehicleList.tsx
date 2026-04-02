'use client';

import { Vehicle, VersionCatalogItem } from '@/types/vehicle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  isEditing: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: number) => void;
  onEditComplete?: () => void;
}

export function VehicleCard({
  vehicle,
  isEditing,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-lg text-gray-900">{vehicle.immatriculation}</h4>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {vehicle.marque_nom} {vehicle.modele_nom} - {vehicle.annee}
            </p>
            <p className="text-xs text-gray-500 mt-1">Châssis: {vehicle.numero_chassis}</p>
            {vehicle.couleur && <p className="text-xs text-gray-500">Couleur: {vehicle.couleur}</p>}
          </div>

          {!isEditing && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(vehicle)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(vehicle.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  isEditing: boolean;
  editingVehicleId: number | null;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: number) => void;
}

export function VehicleList({
  vehicles,
  isLoading,
  isEditing,
  editingVehicleId,
  onEdit,
  onDelete,
}: VehicleListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Chargement des véhicules...</div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">Aucun véhicule enregistré</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          isEditing={editingVehicleId === vehicle.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
