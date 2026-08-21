import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FormikSelect from './FormikSelect';
import VisuallyHiddenInput from './VisuallyHiddenInput';

export default function ImageUploadSection({ formik, zoom, setZoom, handlePickedImage }: any) {
  return (
    <div className='row pt-2 pb-2 gy-3'>
      <div className='col-12'>
        <Typography variant="h4" gutterBottom>
          Image upload and edit
        </Typography>
      </div>
      <div className='col-12'>
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
        <FormikSelect formik={formik} name="cardImageSize" label="Image Size">
          <MenuItem value="full-art" defaultChecked>Full Art</MenuItem>
          <MenuItem value="classic">Classic</MenuItem>
        </FormikSelect>
      </div>
    </div>
  );
}
