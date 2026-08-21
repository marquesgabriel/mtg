import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import TokenCard from './Card';
import { GalleryEntry } from './utils/gallery';
import { parseManaSymbols } from './utils/manaSymbols';
import './PrintSheet.scss';

// A4 with 10mm margins fits a 3x3 grid of standard 63.5x88.9mm cards
// comfortably - the same convention most print-and-play sheets use.
const CARDS_PER_PAGE = 9;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export default function PrintSheetDialog({ open, onClose, entries }: {
  open: boolean;
  onClose: () => void;
  entries: GalleryEntry[];
}) {
  // One card instance per copy, e.g. an entry with copies=3 appears 3 times.
  const cards = entries.flatMap((entry) => Array.from({ length: entry.copies }, () => entry));
  const pages = chunk(cards, CARDS_PER_PAGE);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle className="no-print">
        Print Sheet ({cards.length} card{cards.length === 1 ? '' : 's'} across {pages.length} page{pages.length === 1 ? '' : 's'} + matching backs)
      </DialogTitle>
      <DialogContent>
        {cards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            The gallery is empty - save at least one token first.
          </Typography>
        ) : (
          <div className="print-sheet">
            {pages.map((pageCards, pageIndex) => (
              <div className="print-sheet__page" key={`front-${pageIndex}`}>
                {pageCards.map((entry, cardIndex) => (
                  <div className="print-sheet__card" key={`front-${pageIndex}-${cardIndex}`}>
                    <TokenCard
                      id={`print-card-${pageIndex}-${cardIndex}`}
                      formik={{ values: entry.token }}
                      croppedImage={entry.image}
                      description={parseManaSymbols(entry.token.description)}
                    />
                  </div>
                ))}
              </div>
            ))}
            {/* One card-back sheet per front sheet, same grid position, for manual duplex printing/cutting alignment. */}
            {pages.map((pageCards, pageIndex) => (
              <div className="print-sheet__page" key={`back-${pageIndex}`}>
                {pageCards.map((_entry, cardIndex) => (
                  <div className="print-sheet__card print-sheet__card--back" key={`back-${pageIndex}-${cardIndex}`} />
                ))}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions className="no-print">
        <Button type="button" onClick={onClose}>Close</Button>
        <Button
          type="button"
          variant="contained"
          startIcon={<PrintIcon />}
          disabled={cards.length === 0}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
