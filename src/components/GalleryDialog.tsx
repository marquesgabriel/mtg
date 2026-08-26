import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import PrintIcon from '@mui/icons-material/Print';
import { GalleryEntry } from '../utils';

// A plain `value={entry.copies}` controlled TextField commits on every
// keystroke - on mobile, selecting the default "1" and typing a digit sends
// an intermediate `Number('')` (0) through onCopiesChange's clamp before the
// browser's own select-and-replace gesture finishes, so the "1" reappears
// and fights the new digit (#92). Keeping a local string draft while
// focused, and only committing (parsing + clamping via onCommit) on
// blur/Enter, lets the field be edited freely in the meantime.
function CopiesInput({ value, onCommit }: { value: number; onCommit: (copies: number) => void }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) onCommit(parsed);
    else setDraft(String(value));
  };

  return (
    <TextField
      type="number"
      size="small"
      label="Copies"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          (e.target as HTMLInputElement).blur();
        }
      }}
      inputProps={{ min: 1, style: { width: 56 } }}
    />
  );
}

export default function GalleryDialog({
  open,
  onClose,
  entries,
  onLoad,
  onDelete,
  onCopiesChange,
  onPrintSheet,
}: {
  open: boolean;
  onClose: () => void;
  entries: GalleryEntry[];
  onLoad: (entry: GalleryEntry) => void;
  onDelete: (id: string) => void;
  onCopiesChange: (id: string, copies: number) => void;
  onPrintSheet: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Custom Card Gallery</DialogTitle>
      <DialogContent>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No custom cards saved yet. Use &quot;Save to Gallery&quot; to keep a custom card here
            without downloading a file - you can reopen or delete it later, and set how many copies
            of it should go on a printed sheet.
          </Typography>
        ) : (
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CopiesInput
                      value={entry.copies}
                      onCommit={(copies) => onCopiesChange(entry.id, copies)}
                    />
                    <Tooltip title="Load into form">
                      <IconButton edge="end" onClick={() => onLoad(entry)}>
                        <FileOpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton edge="end" onClick={() => onDelete(entry.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemText
                  primary={entry.token.name || '(unnamed)'}
                  secondary={`${entry.token.type}${entry.token.subType ? ` — ${entry.token.subType}` : ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          variant="contained"
          startIcon={<PrintIcon />}
          disabled={entries.length === 0}
          onClick={onPrintSheet}
        >
          Print Sheet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
