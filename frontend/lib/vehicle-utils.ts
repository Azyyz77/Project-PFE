import { Vehicle, VersionCatalogItem } from '@/types/vehicle';

const TUNIS_PLATE_LABEL = 'تونس';
const NT_PLATE_LABEL = 'ن.ت';

export const VEHICLE_FIELD_LIMITS = {
  immatriculation: 20,
  tunisPart: 3,
  tunisLeftMax: 260,
  tunisRightMin: 3,
  tunisRightMax: 4,
  ntSerial: 5,
  numeroChassis: 17,
  couleur: 50,
  sivFormat: 9, // XX-XXX-XX (9 chars)
  customFormat: 10, // XXX-XX-XXX (10 chars)
};

export type PlateType = '' | 'TUNIS' | 'NT' | 'RS';

export interface VehicleFormState {
  plate_type: 'TUNIS' | 'NT' | 'SIV' | 'CUSTOM';
  tunis_left: string;
  tunis_right: string;
  nt_serial: string;
  siv_format: string; // Pour XX-XXX-XX
  custom_format: string; // Pour XXX-XX-XXX
  numero_chassis: string;
  marque_id: string;
  modele_id: string;
  version_id: string;
  annee: string;
  couleur: string;
}

export const EMPTY_VEHICLE_FORM: VehicleFormState = {
  plate_type: 'TUNIS',
  tunis_left: '',
  tunis_right: '',
  nt_serial: '',
  siv_format: '',
  custom_format: '',
  numero_chassis: '',
  marque_id: '',
  modele_id: '',
  version_id: '',
  annee: '',
  couleur: '',
};

export function validateVehicleForm(form: VehicleFormState): string | null {
  if (!form.plate_type || !form.numero_chassis || !form.version_id || !form.annee) {
    return 'Tous les champs obligatoires du véhicule doivent être remplis.';
  }

  if (form.plate_type === 'TUNIS') {
    const tunisLeft = form.tunis_left.trim();
    const tunisRight = form.tunis_right.trim();

    if (!tunisLeft || !tunisRight) {
      return 'Veuillez compléter les deux parties de la plaque tunisienne.';
    }

    if (!/^\d{1,3}$/.test(tunisLeft)) {
      return 'Le premier bloc doit contenir 1 à 3 chiffres.';
    }

    const tunisLeftValue = Number(tunisLeft);
    if (Number.isNaN(tunisLeftValue) || tunisLeftValue < 1 || tunisLeftValue > VEHICLE_FIELD_LIMITS.tunisLeftMax) {
      return `Le premier bloc doit être entre 1 et ${VEHICLE_FIELD_LIMITS.tunisLeftMax}.`;
    }

    if (!/^\d{3,4}$/.test(tunisRight)) {
      return 'Le second bloc doit contenir 3 ou 4 chiffres.';
    }
  }

  if (form.plate_type === 'NT') {
    if (!form.nt_serial.trim()) {
      return 'Veuillez compléter le numéro du type ن.ت.';
    }

    if (!/^\d{1,5}$/.test(form.nt_serial.trim())) {
      return 'Le type ن.ت exige un bloc numérique de 1 à 5 chiffres.';
    }
  }

  const builtImmatriculation = buildImmatriculation(form);
  if (!builtImmatriculation || builtImmatriculation.length > VEHICLE_FIELD_LIMITS.immatriculation) {
    return `L'immatriculation ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.immatriculation} caractères.`;
  }

  if (form.numero_chassis.trim().length > VEHICLE_FIELD_LIMITS.numeroChassis) {
    return `Le numéro de châssis ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.numeroChassis} caractères.`;
  }

  if (form.couleur.trim().length > VEHICLE_FIELD_LIMITS.couleur) {
    return `La couleur ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.couleur} caractères.`;
  }

  const versionId = Number(form.version_id);
  const annee = Number(form.annee);

  if (Number.isNaN(versionId) || versionId <= 0) {
    return 'version_id doit être un nombre positif.';
  }

  if (Number.isNaN(annee) || annee < 1950 || annee > 2100) {
    return 'Année invalide (1950-2100).';
  }

  return null;
}

export function buildImmatriculation(form: VehicleFormState): string {
  if (form.plate_type === 'TUNIS') {
    return `${form.tunis_left.trim()} ${TUNIS_PLATE_LABEL} ${form.tunis_right.trim()}`;
  }

  if (form.plate_type === 'NT') {
    return `${form.nt_serial.trim()} ${NT_PLATE_LABEL}`;
  }

  if (form.plate_type === 'SIV') {
    return form.siv_format.trim().toUpperCase();
  }

  if (form.plate_type === 'CUSTOM') {
    return form.custom_format.trim().toUpperCase();
  }

  return '';
}

export function parseImmatriculation(immatriculation: string): VehicleFormState {
  const tunisMatch = immatriculation.match(/^(\d{1,3})\s*تونس\s*(\d{3,4})$/u);
  if (tunisMatch) {
    return {
      ...EMPTY_VEHICLE_FORM,
      plate_type: 'TUNIS',
      tunis_left: tunisMatch[1],
      tunis_right: tunisMatch[2],
    };
  }

  const ntMatch = immatriculation.match(/^(\d{1,5})\s*ن\.ت$/u);
  if (ntMatch) {
    return {
      ...EMPTY_VEHICLE_FORM,
      plate_type: 'NT',
      nt_serial: ntMatch[1],
    };
  }

  const sivMatch = immatriculation.match(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/i);
  if (sivMatch) {
    return {
      ...EMPTY_VEHICLE_FORM,
      plate_type: 'SIV',
      siv_format: immatriculation.toUpperCase(),
    };
  }

  const customMatch = immatriculation.match(/^\d{3}-[A-Z]{2}-\d{3}$/i);
  if (customMatch) {
    return {
      ...EMPTY_VEHICLE_FORM,
      plate_type: 'CUSTOM',
      custom_format: immatriculation.toUpperCase(),
    };
  }

  return {
    ...EMPTY_VEHICLE_FORM,
    plate_type: 'TUNIS',
  };
}

export function buildVehicleFormFromVehicle(
  vehicle: Vehicle,
  versions: VersionCatalogItem[]
): VehicleFormState {
  const selectedVersion = versions.find((version) => version.id === vehicle.version_id);
  const parsedPlate = parseImmatriculation(vehicle.immatriculation);

  return {
    plate_type: parsedPlate.plate_type,
    tunis_left: parsedPlate.tunis_left,
    tunis_right: parsedPlate.tunis_right,
    nt_serial: parsedPlate.nt_serial,
    siv_format: parsedPlate.siv_format,
    custom_format: parsedPlate.custom_format,
    numero_chassis: vehicle.numero_chassis,
    marque_id: selectedVersion ? String(selectedVersion.marque_id) : '',
    modele_id: selectedVersion ? String(selectedVersion.modele_id) : '',
    version_id: String(vehicle.version_id),
    couleur: vehicle.couleur || '',
    annee: String(vehicle.annee),
  };
}

export function getBrandOptions(versions: VersionCatalogItem[]) {
  const uniqueBrands = new Map<number, string>();
  versions.forEach((version) => {
    if (!uniqueBrands.has(version.marque_id)) {
      uniqueBrands.set(version.marque_id, version.marque_nom);
    }
  });
  return Array.from(uniqueBrands.entries()).map(([id, nom]) => ({ id: String(id), nom }));
}

export function getModelOptions(marqueId: string, versions: VersionCatalogItem[]) {
  if (!marqueId) return [];
  const uniqueModels = new Map<number, string>();
  versions
    .filter((version) => String(version.marque_id) === marqueId)
    .forEach((version) => {
      if (!uniqueModels.has(version.modele_id)) {
        uniqueModels.set(version.modele_id, version.modele_nom);
      }
    });
  return Array.from(uniqueModels.entries()).map(([id, nom]) => ({ id: String(id), nom }));
}

export function getVersionOptions(marqueId: string, modeleId: string, versions: VersionCatalogItem[]) {
  if (!marqueId || !modeleId) return [];
  return versions.filter(
    (version) => String(version.marque_id) === marqueId && String(version.modele_id) === modeleId
  );
}
