// Single source of truth for what a "token" is as data: the default form
// values, and which of those fields count as part of the token's portable
// data (as opposed to `image`, a blob URL from URL.createObjectURL that
// isn't meaningful outside the current page - see #3). Shared by draft
// persistence (App.tsx), JSON save/load (utils/tokenFile.ts, #6), and the
// token gallery (#7).

export const DEFAULT_TOKEN_VALUES = {
  name: "rat",
  superType: "token",
  type: "creature",
  subType: "rat",
  description: "",
  manaCost: "",
  artist: "",
  power: "1",
  toughness: "1",
  image: "",
  cardBorder: "black",
  cardTexture: "texture6",
  cardColor: "black",
  cardImageSize: "full-art",
};

const NON_SERIALIZABLE_FIELDS = ['image'] as const;

export const TOKEN_FIELD_KEYS = (
  Object.keys(DEFAULT_TOKEN_VALUES) as (keyof typeof DEFAULT_TOKEN_VALUES)[]
).filter((field) => !(NON_SERIALIZABLE_FIELDS as readonly string[]).includes(field));

export type TokenValues = Record<typeof TOKEN_FIELD_KEYS[number], string>;
