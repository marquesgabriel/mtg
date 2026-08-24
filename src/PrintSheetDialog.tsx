import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PrintIcon from '@mui/icons-material/Print';
import { GalleryEntry } from './utils/gallery';
import { renderCardImage } from './utils/renderCardImage';
import './PrintSheet.scss';

// A4 with 10mm margins fits a 3x3 grid of standard 63.5x88.9mm cards
// comfortably - the same convention most print-and-play sheets use.
const CARDS_PER_PAGE = 9;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export default function PrintSheetDialog({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: GalleryEntry[];
}) {
  // Rendered once per unique gallery entry (not once per copy) and kept
  // only for as long as this dialog needs them - not persisted anywhere.
  const [images, setImages] = useState<Record<string, string>>({});
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!open || entries.length === 0) return;
    let cancelled = false;

    setRendering(true);
    (async () => {
      const next: Record<string, string> = {};
      for (const entry of entries) {
        if (cancelled) return;
        next[entry.id] = await renderCardImage(entry.token, entry.image);
      }
      if (!cancelled) {
        setImages(next);
        setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // entries is a new array reference each time the gallery changes, so
    // this intentionally re-renders images whenever the dialog opens or
    // the underlying gallery data changes - not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entries]);

  // One card instance per copy, e.g. an entry with copies=3 appears 3 times.
  const cards = entries.flatMap((entry) => Array.from({ length: entry.copies }, () => entry));
  const pages = chunk(cards, CARDS_PER_PAGE);
  const ready = !rendering && cards.every((entry) => !!images[entry.id]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle className="no-print">
        Print Sheet ({cards.length} card{cards.length === 1 ? '' : 's'} across {pages.length} page
        {pages.length === 1 ? '' : 's'} + matching backs)
      </DialogTitle>
      <DialogContent>
        {cards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            The gallery is empty - save at least one token first.
          </Typography>
        ) : !ready ? (
          <div className="print-sheet__loading no-print">
            <CircularProgress size={24} />
            <Typography variant="body2">Rendering card images…</Typography>
          </div>
        ) : (
          <div className="print-sheet">
            {pages.map((pageCards, pageIndex) => (
              <div className="print-sheet__page" key={`front-${pageIndex}`}>
                {pageCards.map((entry, cardIndex) => (
                  <div className="print-sheet__card" key={`front-${pageIndex}-${cardIndex}`}>
                    <img src={images[entry.id]} alt={entry.token.name || 'Token card'} />
                  </div>
                ))}
              </div>
            ))}
            {/* One card-back sheet per front sheet, same grid position, for manual duplex printing/cutting alignment. */}
            {pages.map((pageCards, pageIndex) => (
              <div className="print-sheet__page" key={`back-${pageIndex}`}>
                {pageCards.map((_entry, cardIndex) => (
                  <div
                    className="print-sheet__card print-sheet__card--back"
                    key={`back-${pageIndex}-${cardIndex}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions className="no-print">
        <Button type="button" onClick={onClose}>
          Close
        </Button>
        <Button
          type="button"
          variant="contained"
          startIcon={<PrintIcon />}
          disabled={!ready || cards.length === 0}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
