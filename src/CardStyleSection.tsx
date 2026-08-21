import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormikSelect from './FormikSelect';

export default function CardStyleSection({ formik }: any) {
  return (
    <div className='row pb-2 gy-3'>
      <div className='col-12'>
        <Typography variant="h4" gutterBottom>
          Card border and color
        </Typography>
      </div>
      <div className='col-6'>
        <FormikSelect formik={formik} name="cardBorder" label="Card Border">
          <MenuItem value="white">White</MenuItem>
          <MenuItem value="black" defaultChecked>Black</MenuItem>
          <MenuItem value="silver">Silver</MenuItem>
          <MenuItem value="golden">Golden</MenuItem>
        </FormikSelect>
      </div>
      <div className='col-6'>
        <FormikSelect formik={formik} name="cardColor" label="Card Color">
          <MenuItem value="white">White</MenuItem>
          <MenuItem value="black">Black</MenuItem>
          <MenuItem value="green">Green</MenuItem>
          <MenuItem value="blue">Blue</MenuItem>
          <MenuItem value="red">Red</MenuItem>
          <MenuItem value="azorius">Blue/White</MenuItem>
          <MenuItem value="boros">Red/White</MenuItem>
          <MenuItem value="dimir">Blue/Black</MenuItem>
          <MenuItem value="gruul">Red/Green</MenuItem>
          <MenuItem value="izzet">Blue/Red</MenuItem>
          <MenuItem value="orzhov">White/Black</MenuItem>
          <MenuItem value="rakdos">Red/Black</MenuItem>
          <MenuItem value="selesnya">White/Green</MenuItem>
          <MenuItem value="simic">Blue/Green</MenuItem>
          <MenuItem value="colorless">Colorless</MenuItem>
          <MenuItem value="multicolor">Multicolor</MenuItem>
        </FormikSelect>
      </div>
      <div className='col-6'>
        <FormikSelect formik={formik} name="cardTexture" label="Card Texture">
          <MenuItem value="texture1">Texture 1</MenuItem>
          <MenuItem value="texture2">Texture 2</MenuItem>
          <MenuItem value="texture3">Texture 3</MenuItem>
          <MenuItem value="texture4">Texture 4</MenuItem>
          <MenuItem value="texture5">Texture 5</MenuItem>
          <MenuItem value="texture6" defaultChecked>Texture 6</MenuItem>
          <MenuItem value="texture7">Texture 7</MenuItem>
          <MenuItem value="texture8">Texture 8</MenuItem>
          <MenuItem value="texture9">Texture 9 (Old multicolor background)</MenuItem>
        </FormikSelect>
      </div>
    </div>
  );
}
