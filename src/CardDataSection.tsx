import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import CollectionsIcon from '@mui/icons-material/Collections';
import FormikTextField from './FormikTextField';
import DownloadAsButton from './DownloadAsButton';
import DescriptionTooltip from './Descriptiontooltip';
import VisuallyHiddenInput from './VisuallyHiddenInput';

export default function CardDataSection({
  formik, parseDescription, downloadAs, handleReset, saveAsJson, loadFromJson,
  saveToGallery, openGallery, galleryCount,
}: any) {
  return (
    <div className='row pt-2 pb-2 gy-3'>
      <div className='col-12'>
        <Typography variant="h4" gutterBottom>
          Card data
        </Typography>
      </div>
      <div className='col-12'>
        <FormikTextField formik={formik} name="name" label="Card Name" />
      </div>
      <div className='col-12'>
        <FormikTextField
          formik={formik}
          name="manaCost"
          fullWidth
          label={<>Mana Cost<DescriptionTooltip title={"For the mana cost, put the symbols between brackets, like {`{2}{u}{u}`} or {`{x}`}"} /></>}
        />
      </div>
      <div className='col-3'>
        <FormikTextField formik={formik} name="superType" label="Supertype" />
      </div>
      <div className='col-5'>
        <FormikTextField formik={formik} name="type" label="Type" />
      </div>
      <div className='col-4'>
        <FormikTextField formik={formik} name="subType" label="Subtype" />
      </div>
      <div className='row'>
        <div className='col-12'>
          <FormikTextField
            formik={formik}
            name="description"
            fullWidth
            multiline
            label={<>Description<DescriptionTooltip /></>}
            onChange={(e) => { formik.handleChange(e); parseDescription(e); }}
          />
        </div>
      </div>
      <div className='col-3'>
        <FormikTextField formik={formik} name="power" label="Power" />
      </div>
      <div className='col-3'>
        <FormikTextField formik={formik} name="toughness" label="Toughness" />
      </div>
      <div className='row'>
        <div className='col-12'>
          <FormikTextField formik={formik} name="artist" fullWidth multiline label="Artist" />
        </div>
      </div>
      <div className='row card-actions-row'>
        <div className='col-12 d-flex justify-content-between align-items-start'>
          <Button type="button" variant="text" size='small' startIcon={<SaveIcon />} onClick={saveAsJson}>
            Save as JSON
          </Button>
          <Button component="label" variant="text" size='small' startIcon={<FileOpenIcon />}>
            Load JSON
            <VisuallyHiddenInput accept='application/json' onChange={loadFromJson} type="file" />
          </Button>
        </div>
      </div>
      <div className='row card-actions-row'>
        <div className='col-12 d-flex justify-content-between align-items-start'>
          <Button type="button" variant="text" size='small' startIcon={<SaveIcon />} onClick={saveToGallery}>
            Save to Gallery
          </Button>
          <Button type="button" variant="text" size='small' onClick={openGallery} startIcon={
            <Badge badgeContent={galleryCount} color="primary">
              <CollectionsIcon />
            </Badge>
          }>
            Gallery
          </Button>
        </div>
      </div>
      <div className='row card-actions-row'>
        <div className='col-12 d-flex justify-content-between align-items-start'>
          <DownloadAsButton downloadAs={downloadAs} />
          <Button type="button" className='pt-2' variant="outlined" color="error" size='small' onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
