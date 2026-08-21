import { styled } from '@mui/material/styles';

// A file <input> that's visually hidden but still focusable/clickable via
// its wrapping label - the standard MUI pattern for a styled "Upload"
// button backed by a native file input. Shared by image upload
// (ImageUploadSection) and JSON load (CardDataSection, #6).
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default VisuallyHiddenInput;
