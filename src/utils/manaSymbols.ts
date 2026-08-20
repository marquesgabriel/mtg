// Converts the bracket syntax used in both the card description and the
// mana cost field (e.g. {u}, {2}, {tap}) into mana-font <i> icon markup.
// Shared so both fields parse identically instead of duplicating the regex
// chain (see issues #8 and the original description parser in App.tsx).
export const parseManaSymbols = (str: string): string => {
  let result = str;

  result = result.replace(/(\{(g)\})/, '<i class="ms ms-g green"></i>');
  result = result.replace(/(\{(w)\})/, '<i class="ms ms-w white"></i>');
  result = result.replace(/(\{(b)\})/, '<i class="ms ms-b black"></i>');
  result = result.replace(/(\{(u)\})/, '<i class="ms ms-u blue"></i>');
  result = result.replace(/(\{(r)\})/, '<i class="ms ms-r red"></i>');
  result = result.replace(/(\{(c)\})/, '<i class="ms ms-c colorless"></i>');
  result = result.replace(/(\{(tap)\})/, '<i class="ms ms-tap colorless"></i>');
  result = result.replace(/(\{(untap)\})/, '<i class="ms ms-untap colorless"></i>');
  result = result.replace(/(\{(x)\})/, '<i class="ms ms-x colorless"></i>');
  result = result.replace(/(\{(0)\})/, '<i class="ms ms-0 colorless"></i>');
  result = result.replace(/(\{(1)\})/, '<i class="ms ms-1 colorless"></i>');
  result = result.replace(/(\{(2)\})/, '<i class="ms ms-2 colorless"></i>');
  result = result.replace(/(\{(3)\})/, '<i class="ms ms-3 colorless"></i>');
  result = result.replace(/(\{(4)\})/, '<i class="ms ms-4 colorless"></i>');
  result = result.replace(/(\{(5)\})/, '<i class="ms ms-5 colorless"></i>');
  result = result.replace(/(\{(6)\})/, '<i class="ms ms-6 colorless"></i>');
  result = result.replace(/(\{(7)\})/, '<i class="ms ms-7 colorless"></i>');
  result = result.replace(/(\{(8)\})/, '<i class="ms ms-8 colorless"></i>');
  result = result.replace(/(\{(9)\})/, '<i class="ms ms-9 colorless"></i>');
  result = result.replace(/(\{(10)\})/, '<i class="ms ms-10 colorless"></i>');
  result = result.replace(/(\{(11)\})/, '<i class="ms ms-11 colorless"></i>');
  result = result.replace(/(\{(12)\})/, '<i class="ms ms-12 colorless"></i>');
  result = result.replace(/(\{(13)\})/, '<i class="ms ms-13 colorless"></i>');
  result = result.replace(/(\{(14)\})/, '<i class="ms ms-14 colorless"></i>');
  result = result.replace(/(\{(15)\})/, '<i class="ms ms-15 colorless"></i>');
  result = result.replace(/(\{(16)\})/, '<i class="ms ms-16 colorless"></i>');
  result = result.replace(/(\{(17)\})/, '<i class="ms ms-17 colorless"></i>');
  result = result.replace(/(\{(18)\})/, '<i class="ms ms-18 colorless"></i>');
  result = result.replace(/(\{(19)\})/, '<i class="ms ms-19 colorless"></i>');
  result = result.replace(/(\{(20)\})/, '<i class="ms ms-20 colorless"></i>');

  return result;
};
