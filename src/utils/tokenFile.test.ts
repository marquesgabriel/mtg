import { serializeToken, isValidTokenFile, tokenValuesFromFile, TOKEN_FILE_VERSION } from './tokenFile';
import { DEFAULT_TOKEN_VALUES, TOKEN_FIELD_KEYS } from './tokenFields';

describe('serializeToken', () => {
  it('picks only the serializable fields, in the current format version', () => {
    const file = serializeToken({ ...DEFAULT_TOKEN_VALUES, name: 'Elite Vanguard' });
    expect(file.version).toBe(TOKEN_FILE_VERSION);
    expect(file.token.name).toBe('Elite Vanguard');
    expect(Object.keys(file.token).sort()).toEqual([...TOKEN_FIELD_KEYS].sort());
  });

  it('excludes the image field (blob URL, not portable)', () => {
    const file = serializeToken({ ...DEFAULT_TOKEN_VALUES, image: 'blob:http://localhost/abc' });
    expect(file.token).not.toHaveProperty('image');
  });

  it('defaults a missing field to an empty string', () => {
    const file = serializeToken({});
    expect(file.token.name).toBe('');
  });
});

describe('isValidTokenFile', () => {
  it('accepts a well-formed file', () => {
    const file = serializeToken(DEFAULT_TOKEN_VALUES);
    expect(isValidTokenFile(file)).toBe(true);
  });

  it('rejects null/non-object input', () => {
    expect(isValidTokenFile(null)).toBe(false);
    expect(isValidTokenFile('not an object')).toBe(false);
  });

  it('rejects a file missing the version field', () => {
    const file = serializeToken(DEFAULT_TOKEN_VALUES) as any;
    delete file.version;
    expect(isValidTokenFile(file)).toBe(false);
  });

  it('rejects a file whose token is missing a required field', () => {
    const file = serializeToken(DEFAULT_TOKEN_VALUES) as any;
    delete file.token.name;
    expect(isValidTokenFile(file)).toBe(false);
  });

  it('rejects a file whose token has a non-string field', () => {
    const file = serializeToken(DEFAULT_TOKEN_VALUES) as any;
    file.token.power = 1;
    expect(isValidTokenFile(file)).toBe(false);
  });
});

describe('tokenValuesFromFile', () => {
  it('fills in missing fields from DEFAULT_TOKEN_VALUES', () => {
    const values = tokenValuesFromFile({ version: 1, token: { name: 'Rat' } as any });
    expect(values.name).toBe('Rat');
    expect(values.type).toBe(DEFAULT_TOKEN_VALUES.type);
  });
});
