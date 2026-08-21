import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
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
import { GalleryEntry } from './utils/gallery';

export default function GalleryDialog({ open, onClose, entries, onLoad, onDelete, onCopiesChange }: {
  open: boolean;
  onClose: () => void;
  entries: GalleryEntry[];
  onLoad: (entry: GalleryEntry) => void;
  onDelete: (id: string) => void;
  onCopiesChange: (id: string, copies: number) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Token Gallery</DialogTitle>
      <DialogContent>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No tokens saved yet. Use "Save to Gallery" to keep a token here without
            downloading a file - you can reopen or delete it later, and set how many
            copies of it should go on a printed sheet.
          </Typography>
        ) : (
          <List>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      type="number"
                      size="small"
                      label="Copies"
                      value={entry.copies}
                      onChange={(e) => onCopiesChange(entry.id, Number(e.target.value))}
                      inputProps={{ min: 1, style: { width: 56 } }}
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
    </Dialog>
  );
}
