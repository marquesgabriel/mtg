import { createRoot } from 'react-dom/client';
import domtoimage from 'dom-to-image';
import TokenCard from '../Card';
import { parseManaSymbols } from './manaSymbols';
import { TokenValues } from './tokenFields';
import { waitForCaptureReady } from './captureReady';

// Same DPI scaling as the single-card "Download as..." export (App.tsx's
// downloadAs) - dom-to-image otherwise captures at on-screen CSS pixel
// size (~96dpi), too low resolution for print.
const PRINT_DPI = 300;
const SCREEN_DPI = 96;
const SCALE = PRINT_DPI / SCREEN_DPI;

// React 18's createRoot().render() is concurrent by default and gives no
// synchronous guarantee the DOM was updated - a fixed number of
// requestAnimationFrame callbacks can still fire before the commit lands,
// intermittently throwing "#id not found". flushSync can't fix this here:
// this runs inside PrintSheetDialog's useEffect, which React can consider
// "already rendering" depending on what else is happening in the app at
// that moment, and flushSync silently no-ops (with a console warning) in
// that case instead of forcing the commit. A MutationObserver sidesteps
// React's internal scheduling state entirely by watching for the actual
// DOM node to appear.
function waitForNode(container: HTMLElement, id: string, timeoutMs = 3000): Promise<HTMLElement> {
  const existing = container.querySelector(`#${id}`) as HTMLElement | null;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const node = container.querySelector(`#${id}`) as HTMLElement | null;
      if (node) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(node);
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`renderCardImage: timed out waiting for #${id} to mount`));
    }, timeoutMs);
  });
}

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
    root.render(
      <TokenCard
        id="offscreen-print-card"
        formik={{ values: token }}
        croppedImage={image}
        description={parseManaSymbols(token.description)}
      />,
    );

    const node = await waitForNode(container, 'offscreen-print-card');
    // The freshly mounted card's <img> (the gallery entry's art) may not
    // have decoded yet, and fonts may still be loading on a cold cache -
    // wait for both (see utils/captureReady.ts) before rasterizing.
    await waitForCaptureReady(node);
    // .card-wrapper's own background-color already matches its border
    // color (see Card/index.scss's *-border classes) - using it as the
    // capture's bgcolor (instead of a hardcoded black) means the rounded
    // corners outside the border-radius match the live preview instead of
    // showing a black canvas background through them.
    const cardBgColor = getComputedStyle(node).backgroundColor;
    return (await domtoimage.toPng(node, {
      quality: 1,
      bgcolor: cardBgColor,
      width: node.offsetWidth * SCALE,
      height: node.offsetHeight * SCALE,
      style: {
        // #offscreen-print-card (.card-wrapper) is box-sizing: content-box,
        // so its border is normally added on top of the declared
        // width/height. node.offsetWidth/offsetHeight already include that
        // border, so without forcing border-box here, dom-to-image's clone
        // re-adds the border on top of an already border-inclusive size -
        // the clone ends up larger than the canvas it's captured into, and
        // the overflow (the border itself, on the far side from
        // transformOrigin) gets clipped off (golden border only visible on
        // two sides in print-sheet renders). Same fix as App.tsx's
        // downloadAs.
        boxSizing: 'border-box',
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`,
      },
    })) as string;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
