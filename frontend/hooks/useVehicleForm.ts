import { useState, useCallback } from 'react';
import { Vehicle, VersionCatalogItem } from '@/types/vehicle';
import {
  getModelOptions,
  getVersionOptions,
  VehicleFormState,
  EMPTY_VEHICLE_FORM,
  buildImmatriculation,
  validateVehicleForm,
} from '@/lib/vehicle-utils';
import { Toast } from '@/lib/toast';

interface UseVehicleFormProps {
  versions: VersionCatalogItem[];
  onSuccess: () => void;
}

export function useVehicleForm({ versions, onSuccess }: UseVehicleFormProps) {
  const [form, setForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setForm((prev) => {
        if (name === 'plate_type') {
          return {
            ...prev,
            plate_type: value as any,
            tunis_left: '',
            tunis_right: '',
            nt_serial: '',
          };
        }

        if (name === 'marque_id') {
          return {
            ...prev,
            marque_id: value,
            modele_id: '',
            version_id: '',
          };
        }

        if (name === 'modele_id') {
          return {
            ...prev,
            modele_id: value,
            version_id: '',
          };
        }

        return {
          ...prev,
          [name]: value,
        };
      });
    },
    []
  );

  const validateAndGet = useCallback(() => {
    const validationError = validateVehicleForm(form);
    if (validationError) {
      setError(validationError);
      Toast.error(validationError);
      return null;
    }
    return buildImmatriculation(form);
  }, [form]);

  const reset = useCallback(() => {
    setForm(EMPTY_VEHICLE_FORM);
    setError('');
  }, []);

  const modelOptions = getModelOptions(form.marque_id, versions);
  const versionOptions = getVersionOptions(form.marque_id, form.modele_id, versions);

  return {
    form,
    setForm,
    error,
    setError,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    validateAndGet,
    reset,
    modelOptions,
    versionOptions,
  };
}
