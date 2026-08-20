import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DownloadAsButton from './DownloadAsButton';
import DescriptionTooltip from './Descriptiontooltip';

export default function CardDataSection({ formik, parseDescription, downloadAs, handleReset }: any) {
  return (
    <div className='row pt-2 pb-2 gy-3'>
      <div className='col-12'>
        <Typography variant="h4" gutterBottom>
          Card data
        </Typography>
      </div>
      <div className='col-12'>
        <TextField
          label="Card Name"
          variant="standard"
          id="name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </div>
      <div className='col-12'>
        <TextField
          fullWidth
          label={<>Mana Cost<DescriptionTooltip title={"For the mana cost, put the symbols between brackets, like {`{2}{u}{u}`} or {`{x}`}"} /></>}
          variant="standard"
          id="manaCost"
          name="manaCost"
          value={formik.values.manaCost}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.manaCost && Boolean(formik.errors.manaCost)}
          helperText={formik.touched.manaCost && formik.errors.manaCost}
        />
      </div>
      <div className='col-3'>
        <TextField
          label="Supertype"
          variant="standard"
          id="superType"
          name="superType"
          value={formik.values.superType}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.superType && Boolean(formik.errors.superType)}
          helperText={formik.touched.superType && formik.errors.superType}
        />
      </div>
      <div className='col-5'>
        <TextField
          label="Type"
          variant="standard"
          id="type"
          name="type"
          value={formik.values.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.type && Boolean(formik.errors.type)}
          helperText={formik.touched.type && formik.errors.type}
        />
      </div>
      <div className='col-4'>
        <TextField
          label="Subtype"
          variant="standard"
          id="subType"
          name="subType"
          value={formik.values.subType}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.subType && Boolean(formik.errors.subType)}
          helperText={formik.touched.subType && formik.errors.subType}
        />
      </div>
      <div className='row'>
        <div className='col-12'>
          <TextField
            fullWidth
            label={<>Description<DescriptionTooltip /></>}
            variant="standard"
            id="description"
            name="description"
            multiline={true}
            value={formik.values.description}
            onChange={(e: any) => { formik.handleChange(e); parseDescription(e) }}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </div>
      </div>
      <div className='col-3'>
        <TextField
          label="Power"
          variant="standard"
          id="power"
          name="power"
          value={formik.values.power}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.power && Boolean(formik.errors.power)}
          helperText={formik.touched.power && formik.errors.power}
        />
      </div>
      <div className='col-3'>
        <TextField
          label="Toughness"
          variant="standard"
          id="toughness"
          name="toughness"
          value={formik.values.toughness}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.toughness && Boolean(formik.errors.toughness)}
          helperText={formik.touched.toughness && formik.errors.toughness}
        />
      </div>
      <div className='row'>
        <div className='col-12'>
          <TextField
            fullWidth
            label="Artist"
            variant="standard"
            id="artist"
            name="artist"
            multiline={true}
            value={formik.values.artist}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.artist && Boolean(formik.errors.artist)}
            helperText={formik.touched.artist && formik.errors.artist}
          />
        </div>
      </div>
      <div className='row card-actions-row'>
        <div className='col-12 d-flex justify-content-between align-items-start'>
          <DownloadAsButton downloadAs={downloadAs} />
          <Button className='pt-2' variant="outlined" color="error" size='small' onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
