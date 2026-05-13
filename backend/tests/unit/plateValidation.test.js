// Unit tests for plate validation

describe('Plate Validation Utilities', () => {
  const TUNIS_STANDARD_PLATE_REGEX = /^(\d{1,3})\s*تونس\s*(\d{3,4})$/u;
  const NT_PLATE_REGEX = /^(\d{1,5})\s*ن\.ت$/u;
  const SIV_PLATE_REGEX = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  const CUSTOM_PLATE_REGEX = /^\d{3}-[A-Z]{2}-\d{3}$/;

  const isValidPlate = (immatriculation) => {
    return TUNIS_STANDARD_PLATE_REGEX.test(immatriculation) ||
           NT_PLATE_REGEX.test(immatriculation) ||
           SIV_PLATE_REGEX.test(immatriculation) ||
           CUSTOM_PLATE_REGEX.test(immatriculation);
  };

  it('should validate valid SIV formats (XX-XXX-XX)', () => {
    expect(isValidPlate('AB-123-CD')).toBe(true);
    expect(isValidPlate('ZZ-999-ZZ')).toBe(true);
  });

  it('should invalidate invalid SIV formats', () => {
    expect(isValidPlate('ab-123-cd')).toBe(false); // Lowercase
    expect(isValidPlate('A-123-CD')).toBe(false); // Missing letter
    expect(isValidPlate('AB-12-CD')).toBe(false); // Missing digit
    expect(isValidPlate('AB 123 CD')).toBe(false); // Spaces instead of dashes
  });

  it('should validate valid CUSTOM formats (XXX-XX-XXX)', () => {
    expect(isValidPlate('123-AB-456')).toBe(true);
    expect(isValidPlate('000-ZZ-999')).toBe(true);
  });

  it('should invalidate invalid CUSTOM formats', () => {
    expect(isValidPlate('123-ab-456')).toBe(false); // Lowercase
    expect(isValidPlate('12-AB-456')).toBe(false); // Missing digit
    expect(isValidPlate('123-A-456')).toBe(false); // Missing letter
    expect(isValidPlate('123 AB 456')).toBe(false); // Spaces instead of dashes
  });

  it('should validate valid TUNIS formats', () => {
    expect(isValidPlate('123 تونس 4567')).toBe(true);
    expect(isValidPlate('1 تونس 123')).toBe(true);
  });

  it('should validate valid NT formats', () => {
    expect(isValidPlate('12345 ن.ت')).toBe(true);
  });
});
