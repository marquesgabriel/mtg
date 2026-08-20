import { parseManaSymbols } from './manaSymbols';

test('replaces a single mana symbol', () => {
  expect(parseManaSymbols('{u}')).toBe('<i class="ms ms-u blue"></i>');
});

test('replaces repeated occurrences of the same symbol', () => {
  const result = parseManaSymbols('{u}{u}{u}');
  expect(result).toBe(
    '<i class="ms ms-u blue"></i>'.repeat(3),
  );
});

test('replaces multiple different symbols in one string, including repeats', () => {
  const result = parseManaSymbols('{2}{u}{u}{tap}');
  expect(result).toBe(
    '<i class="ms ms-2 colorless"></i>' +
    '<i class="ms ms-u blue"></i>' +
    '<i class="ms ms-u blue"></i>' +
    '<i class="ms ms-tap colorless"></i>',
  );
});

test('leaves plain text around symbols untouched', () => {
  expect(parseManaSymbols('Tap: add {u}.')).toBe('Tap: add <i class="ms ms-u blue"></i>.');
});
