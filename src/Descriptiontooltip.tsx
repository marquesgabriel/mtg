import * as React from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const DEFAULT_TITLE =
  'For the card description, you can add mana or tap symbols by putting the symbols between brackets, like {`{tap}, {u} or {x}`}';

export default function DescriptionTooltip({ title = DEFAULT_TITLE }: { title?: string }) {
  return (
    <Tooltip title={title}>
      <IconButton>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
