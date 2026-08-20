import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CropIcon from '@mui/icons-material/Crop';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';

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

export default function ImageUploadSection({ formik, zoom, setZoom, cropMyImage, handlePickedImage }: any) {
  return (
    <div className='row pt-2 pb-2 gy-3'>
      <div className='col-12'>
        <Typography variant="h4" gutterBottom>
          Image upload and edit
        </Typography>
      </div>
      <div className='col-6'>
        <div className='d-flex justify-content-center'>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            size='small'
            tabIndex={-1}
            startIcon={<FileUploadIcon />}
          >
            Upload file
            <VisuallyHiddenInput accept='image/jpeg, image/png' onChange={handlePickedImage} type="file" />
          </Button>
        </div>
      </div>
      <div className='col-6'>
        <div className='d-flex justify-content-center'>
          <Button
            component="label"
            variant="contained"
            tabIndex={-1}
            size='small'
            color='success'
            onClick={cropMyImage}
            startIcon={<CropIcon />}
          >
            Confirm image crop
          </Button>
        </div>
      </div>
      <div className='col-12'>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <ZoomOut />
          <Slider aria-label="Zoom"
            value={zoom}
            step={.05}
            marks
            min={1}
            max={3}
            onChange={(e: any) => {
              setZoom(e.target.value)
            }}
          />
          <ZoomIn />
        </Stack>
      </div>
      <div className='col-6'>
        <InputLabel id="cardImageSize">Image Size</InputLabel>
        <Select
          fullWidth
          label="Image Size"
          variant="standard"
          id="cardImageSize"
          name="cardImageSize"
          value={formik.values.cardImageSize}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.cardImageSize && Boolean(formik.errors.cardImageSize)}
        >
          <MenuItem value="full-art" defaultChecked>Full Art</MenuItem>
          <MenuItem value="classic">Classic</MenuItem>
        </Select>
      </div>
    </div>
  );
}
