// Converts the bracket syntax used in both the card description and the
// mana cost field (e.g. {u}, {2}, {tap}) into mana-font <i> icon markup.
// Shared so both fields parse identically instead of duplicating the regex
// chain (see issues #8 and the original description parser in App.tsx).
export const parseManaSymbols = (str: string): string => {
  let result = str;

  // The "g" flag matters: without it, String.replace only swaps the FIRST
  // occurrence of each symbol, so repeated symbols like "{u}{u}" left the
  // second one as literal text.
  result = result.replace(/(\{(g)\})/g, '<i class="ms ms-g green"></i>');
  result = result.replace(/(\{(w)\})/g, '<i class="ms ms-w white"></i>');
  result = result.replace(/(\{(b)\})/g, '<i class="ms ms-b black"></i>');
  result = result.replace(/(\{(u)\})/g, '<i class="ms ms-u blue"></i>');
  result = result.replace(/(\{(r)\})/g, '<i class="ms ms-r red"></i>');
  result = result.replace(/(\{(c)\})/g, '<i class="ms ms-c colorless"></i>');
  result = result.replace(/(\{(tap)\})/g, '<i class="ms ms-tap colorless"></i>');
  result = result.replace(/(\{(untap)\})/g, '<i class="ms ms-untap colorless"></i>');
  result = result.replace(/(\{(x)\})/g, '<i class="ms ms-x colorless"></i>');
  result = result.replace(/(\{(0)\})/g, '<i class="ms ms-0 colorless"></i>');
  result = result.replace(/(\{(1)\})/g, '<i class="ms ms-1 colorless"></i>');
  result = result.replace(/(\{(2)\})/g, '<i class="ms ms-2 colorless"></i>');
  result = result.replace(/(\{(3)\})/g, '<i class="ms ms-3 colorless"></i>');
  result = result.replace(/(\{(4)\})/g, '<i class="ms ms-4 colorless"></i>');
  result = result.replace(/(\{(5)\})/g, '<i class="ms ms-5 colorless"></i>');
  result = result.replace(/(\{(6)\})/g, '<i class="ms ms-6 colorless"></i>');
  result = result.replace(/(\{(7)\})/g, '<i class="ms ms-7 colorless"></i>');
  result = result.replace(/(\{(8)\})/g, '<i class="ms ms-8 colorless"></i>');
  result = result.replace(/(\{(9)\})/g, '<i class="ms ms-9 colorless"></i>');
  result = result.replace(/(\{(10)\})/g, '<i class="ms ms-10 colorless"></i>');
  result = result.replace(/(\{(11)\})/g, '<i class="ms ms-11 colorless"></i>');
  result = result.replace(/(\{(12)\})/g, '<i class="ms ms-12 colorless"></i>');
  result = result.replace(/(\{(13)\})/g, '<i class="ms ms-13 colorless"></i>');
  result = result.replace(/(\{(14)\})/g, '<i class="ms ms-14 colorless"></i>');
  result = result.replace(/(\{(15)\})/g, '<i class="ms ms-15 colorless"></i>');
  result = result.replace(/(\{(16)\})/g, '<i class="ms ms-16 colorless"></i>');
  result = result.replace(/(\{(17)\})/g, '<i class="ms ms-17 colorless"></i>');
  result = result.replace(/(\{(18)\})/g, '<i class="ms ms-18 colorless"></i>');
  result = result.replace(/(\{(19)\})/g, '<i class="ms ms-19 colorless"></i>');
  result = result.replace(/(\{(20)\})/g, '<i class="ms ms-20 colorless"></i>');

  return result;
};
