import { createRoot } from 'react-dom/client';
import domtoimage from 'dom-to-image';
import TokenCard from '../Card';
import { parseManaSymbols } from './manaSymbols';
import { TokenValues } from './tokenFields';

// Same DPI scaling as the single-card "Download as..." export (App.tsx's
// downloadAs) - dom-to-image otherwise captures at on-screen CSS pixel
// size (~96dpi), too low resolution for print.
const PRINT_DPI = 300;
const SCREEN_DPI = 96;
const SCALE = PRINT_DPI / SCREEN_DPI;

// Renders a TokenCard for the given token/image off-screen and captures it
// as a PNG data URL via the exact same dom-to-image pipeline already used
// (and already trusted) for the single-card download - rather than
// re-rendering the card live inside the print sheet's own CSS grid, which
// requires the sheet's layout to exactly match the live preview's and is
// what caused the sheet's cards to come out overlapping/distorted in the
// first place. The print sheet becomes a grid of plain <img> tags built
// from these pre-rendered captures instead.
export async function renderCardImage(token: TokenValues, image: string): Promise<string> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-99999px'; // off-screen, but still laid out/painted - domtoimage needs real layout
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    await new Promise<void>((resolve) => {
      root.render(
        <TokenCard
          id="offscreen-print-card"
          formik={{ values: token }}
          croppedImage={image}
          description={parseManaSymbols(token.description)}
        />
      );
      // Two rAFs: one to let React commit the render, one to let the
      // browser paint it - dom-to-image needs actual pixels on screen
      // (even if off-screen), not just DOM nodes.
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const node = container.querySelector('#offscreen-print-card') as HTMLElement | null;
    if (!node) {
      throw new Error(`renderCardImage: #offscreen-print-card not found in offscreen container. innerHTML: ${container.innerHTML.slice(0, 500)}`);
    }
    // The card's title/type-line/etc use self-hosted @font-face fonts
    // (src/styles/_fonts.scss). On a cold cache those can still be loading
    // after the rAFs above resolve, so dom-to-image would capture the
    // fallback system font instead - wait for every requested font to
    // actually finish before rasterizing.
    await document.fonts.ready;
    return await domtoimage.toPng(node, {
      quality: 1,
      bgcolor: '#000',
      width: node.offsetWidth * SCALE,
      height: node.offsetHeight * SCALE,
      style: {
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`,
      },
    }) as string;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
