'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { VersionCatalogItem } from '@/types/vehicle';
import { VehicleFormState, VEHICLE_FIELD_LIMITS } from '@/lib/vehicle-utils';
import { getBrandOptions, getModelOptions, getVersionOptions } from '@/lib/vehicle-utils';

interface VehicleFormProps {
  form: VehicleFormState;
  isSubmitting: boolean;
  error: string;
  versions: VersionCatalogItem[];
  modelOptions: { id: string; nom: string }[];
  versionOptions: VersionCatalogItem[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function VehicleForm({
  form,
  isSubmitting,
  error,
  versions,
  modelOptions,
  versionOptions,
  onInputChange,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const brandOptions = getBrandOptions(versions);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">
          Ajouter un Nouveau Véhicule
        </h3>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={form.plate_type} onValueChange={(value) => {
              const e = { target: { name: 'plate_type', value } } as any;
              onInputChange(e);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Type immatriculation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TUNIS">Type Tunisie</SelectItem>
                <SelectItem value="NT">Type ن.ت</SelectItem>
              </SelectContent>
            </Select>

            {form.plate_type === 'TUNIS' && (
              <>
                <Input
                  type="number"
                  placeholder="Partie gauche"
                  value={form.tunis_left}
                  onChange={onInputChange}
                  name="tunis_left"
                  maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                />
                <Input
                  type="number"
                  placeholder="Partie droite"
                  value={form.tunis_right}
                  onChange={onInputChange}
                  name="tunis_right"
                  maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                />
              </>
            )}

            {form.plate_type === 'NT' && (
              <Input
                type="number"
                placeholder="Numéro ن.ت"
                value={form.nt_serial}
                onChange={onInputChange}
                name="nt_serial"
                maxLength={VEHICLE_FIELD_LIMITS.ntSerial}
              />
            )}

            <Input
              type="text"
              placeholder="Numéro de châssis"
              value={form.numero_chassis}
              onChange={onInputChange}
              name="numero_chassis"
              maxLength={VEHICLE_FIELD_LIMITS.numeroChassis}
            />

            <Select value={form.marque_id} onValueChange={(value) => {
              const e = { target: { name: 'marque_id', value } } as any;
              onInputChange(e);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Marque" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.modele_id} onValueChange={(value) => {
              const e = { target: { name: 'modele_id', value } } as any;
              onInputChange(e);
            }} disabled={!form.marque_id}>
              <SelectTrigger>
                <SelectValue placeholder="Modèle" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.version_id} onValueChange={(value) => {
              const e = { target: { name: 'version_id', value } } as any;
              onInputChange(e);
            }} disabled={!form.modele_id}>
              <SelectTrigger>
                <SelectValue placeholder="Version" />
              </SelectTrigger>
              <SelectContent>
                {versionOptions.map((version) => (
                  <SelectItem key={version.id} value={String(version.id)}>
                    {version.version_nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Année"
              value={form.annee}
              onChange={onInputChange}
              name="annee"
            />

            <Input
              type="text"
              placeholder="Couleur (optionnel)"
              value={form.couleur}
              onChange={onInputChange}
              name="couleur"
              maxLength={VEHICLE_FIELD_LIMITS.couleur}
              className="sm:col-span-2"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
