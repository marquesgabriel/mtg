import { DEFAULT_TOKEN_VALUES, TOKEN_FIELD_KEYS, TokenValues } from './tokenFields';

// A saved token file's shape on disk (and, from #7 onward, in the gallery's
// localStorage entries). `version` exists so a future format change can be
// detected/migrated instead of silently misreading an older file.
export const TOKEN_FILE_VERSION = 1;

export interface TokenFile {
  version: number;
  token: TokenValues;
}

export function serializeToken(values: Record<string, any>): TokenFile {
  const token = {} as TokenValues;
  TOKEN_FIELD_KEYS.forEach((key) => {
    (token as Record<string, string>)[key] = values[key] ?? '';
  });
  return { version: TOKEN_FILE_VERSION, token };
}

export function isValidTokenFile(data: any): data is TokenFile {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof data.version === 'number' &&
    !!data.token &&
    typeof data.token === 'object' &&
    TOKEN_FIELD_KEYS.every((key) => typeof data.token[key] === 'string')
  );
}

// Merges onto DEFAULT_TOKEN_VALUES rather than trusting the file's `token`
// object alone, so a file from an older format version that's missing a
// field (added since) still loads with a sane default instead of `undefined`.
export function tokenValuesFromFile(file: TokenFile): TokenValues {
  return { ...DEFAULT_TOKEN_VALUES, ...file.token };
}
