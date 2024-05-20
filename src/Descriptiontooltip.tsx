import * as React from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function DescriptionTooltip() {
  return (
    <Tooltip title="For the card description, you can add mana or tap symbols by putting the symbols between brackets, like {`{tap}, {u} or {x}`}">
      <IconButton>
        <HelpOutlineIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  );
}