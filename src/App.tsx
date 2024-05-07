import { useRef, useState } from 'react';
import { Point, Area } from "react-easy-crop/types";
import { useFormik, FormikProvider } from 'formik';
import * as yup from "yup";
import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CropIcon from '@mui/icons-material/Crop';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Typography from '@mui/material/Typography';



import './App.scss';
import TokenCard from './Card';
import getCroppedImg from './utils/cropper';

function App() {

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState<any>(null);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const printRef = useRef<any>();
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  };
  const [image, setImage] = useState("https://images.theconversation.com/files/123291/original/image-20160520-4451-87u0j1.jpg");
  const [description, setDescription] = useState("");

  const cropMyImage = async () => {
    try {
      const croppedProduct = await getCroppedImg(
        image,
        croppedArea,
        0 // this is the rotation value
      )
      setCroppedImage(croppedProduct)
    } catch (e) {
      console.error(e)
    }
  }

  const downloadAs = (ext: string) => {
    switch (ext) {
      case 'jpg':
        exportComponentAsJPEG(printRef)
        break;
      case 'png':
        exportComponentAsPNG(printRef)
        break;
      case 'pdf':
        exportComponentAsPDF(printRef)
        break;
      default:
        break;
    }
  }

  const parseDescription = (e: any) => {
    let str: string = e.target.value;

    str = str.replace(/(\{(g)\})/, '<i class="ms ms-g green"></i>');
    str = str.replace(/(\{(w)\})/, '<i class="ms ms-w white"></i>');
    str = str.replace(/(\{(b)\})/, '<i class="ms ms-b black"></i>');
    str = str.replace(/(\{(u)\})/, '<i class="ms ms-u blue"></i>');
    str = str.replace(/(\{(r)\})/, '<i class="ms ms-r red"></i>');
    str = str.replace(/(\{(c)\})/, '<i class="ms ms-c colorless"></i>');
    str = str.replace(/(\{(tap)\})/, '<i class="ms ms-tap colorless"></i>');
    str = str.replace(/(\{(untap)\})/, '<i class="ms ms-untap colorless"></i>');
    str = str.replace(/(\{(x)\})/, '<i class="ms ms-x colorless"></i>');
    str = str.replace(/(\{(0)\})/, '<i class="ms ms-0 colorless"></i>');
    str = str.replace(/(\{(1)\})/, '<i class="ms ms-1 colorless"></i>');
    str = str.replace(/(\{(2)\})/, '<i class="ms ms-2 colorless"></i>');
    str = str.replace(/(\{(3)\})/, '<i class="ms ms-3 colorless"></i>');
    str = str.replace(/(\{(4)\})/, '<i class="ms ms-4 colorless"></i>');
    str = str.replace(/(\{(5)\})/, '<i class="ms ms-5 colorless"></i>');
    str = str.replace(/(\{(6)\})/, '<i class="ms ms-6 colorless"></i>');
    str = str.replace(/(\{(7)\})/, '<i class="ms ms-7 colorless"></i>');
    str = str.replace(/(\{(8)\})/, '<i class="ms ms-8 colorless"></i>');
    str = str.replace(/(\{(9)\})/, '<i class="ms ms-9 colorless"></i>');
    str = str.replace(/(\{(10)\})/, '<i class="ms ms-10 colorless"></i>');
    str = str.replace(/(\{(11)\})/, '<i class="ms ms-11 colorless"></i>');
    str = str.replace(/(\{(12)\})/, '<i class="ms ms-12 colorless"></i>');
    str = str.replace(/(\{(13)\})/, '<i class="ms ms-13 colorless"></i>');
    str = str.replace(/(\{(14)\})/, '<i class="ms ms-14 colorless"></i>');
    str = str.replace(/(\{(15)\})/, '<i class="ms ms-15 colorless"></i>');
    str = str.replace(/(\{(16)\})/, '<i class="ms ms-16 colorless"></i>');
    str = str.replace(/(\{(17)\})/, '<i class="ms ms-17 colorless"></i>');
    str = str.replace(/(\{(18)\})/, '<i class="ms ms-18 colorless"></i>');
    str = str.replace(/(\{(19)\})/, '<i class="ms ms-19 colorless"></i>');
    str = str.replace(/(\{(20)\})/, '<i class="ms ms-20 colorless"></i>');

    setDescription(str)

  }

  const form = yup.object({
    name: yup.string().required("This field is required"),
    superType: yup.string().nullable(),
    type: yup.string().required("This field is required"),
    subType: yup.string().nullable(),
    description: yup.string().nullable(),
    artist: yup.string().nullable(),
    power: yup.string().nullable(),
    toughness: yup.string().nullable(),
    image: yup.string().required("This field is required"),
    cardBorder: yup.string().required("This field is required"),
    cardTexture: yup.string().required("This field is required"),
    cardColor: yup.string().required("This field is required"),
    cardImageSize: yup.string().required("This field is required")
  })

  const formik = useFormik({
    initialValues: {
      name: "rat",
      superType: "token",
      type: "creature",
      subType: "rat",
      description: "",
      artist: "",
      power: "1",
      toughness: "1",
      image: "",
      cardBorder: "black",
      cardTexture: "texture6",
      cardColor: "colorless",
      cardImageSize: "full-art"
    },
    validationSchema: form,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });

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

  const handlePickedImage = (event: any) => {
    setCroppedImage(null);
    setImage(URL.createObjectURL(event.target.files[0]))
  }

  return (
    <div className='container'>
      <div className="row">
        <div className="card-inputs col-lg-6 col-md-12">
          {/* TODO create guide for special symbols */}
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit}>
              <div className="row pb-2">
                <div className='col-12'>
                  <Typography variant="h4" gutterBottom>
                    Card border and color
                  </Typography>
                </div>
                <div className='col-6'>
                  <InputLabel id="cardBorder">Card Border</InputLabel>
                  <Select
                    fullWidth
                    label="Card Border"
                    variant="standard"
                    id="cardBorder"
                    name="cardBorder"
                    value={formik.values.cardBorder}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.cardBorder && Boolean(formik.errors.cardBorder)}
                  >
                    <MenuItem value="white">White</MenuItem>
                    <MenuItem value="black" defaultChecked>Black</MenuItem>
                    <MenuItem value="silver" disabled>Silver</MenuItem>
                    <MenuItem value="golden" disabled>Golden</MenuItem>
                  </Select>
                </div>
                <div className='col-6'>
                  <InputLabel id="cardColor">Card Color</InputLabel>
                  <Select
                    fullWidth
                    label="Card Color"
                    variant="standard"
                    id="cardColor"
                    name="cardColor"
                    value={formik.values.cardColor}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.cardColor && Boolean(formik.errors.cardColor)}
                  >
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
                    <MenuItem value="colorless" defaultChecked>Colorless</MenuItem>
                    <MenuItem value="multicolor">Multicolor</MenuItem>
                  </Select>
                </div>
                <div className='col-6'>
                  <InputLabel id="cardTexture">Card Texture</InputLabel>
                  <Select
                    fullWidth
                    label="Card Texture"
                    variant="standard"
                    id="cardTexture"
                    name="cardTexture"
                    value={formik.values.cardTexture}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.cardTexture && Boolean(formik.errors.cardTexture)}
                  >
                    <MenuItem value="texture1">Texture 1</MenuItem>
                    <MenuItem value="texture2">Texture 2</MenuItem>
                    <MenuItem value="texture3">Texture 3</MenuItem>
                    <MenuItem value="texture4">Texture 4</MenuItem>
                    <MenuItem value="texture5">Texture 5</MenuItem>
                    <MenuItem value="texture6" defaultChecked>Texture 6</MenuItem>
                    <MenuItem value="texture7">Texture 7</MenuItem>
                    <MenuItem value="texture8">Texture 8</MenuItem>
                    <MenuItem value="texture9">Texture 9 (Old multicolor background)</MenuItem>
                  </Select>
                </div>
              </div>
              <Divider />
              <div className='row pt-2 pb-2'>
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
              <Divider />
              <div className='row pt-2 pb-2'>
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
                      label={<>Description <HelpOutlineIcon /></>}
                      variant="standard"
                      id="description"
                      name="description"
                      multiline={true}
                      value={formik.values.description}
                      onChange={(e) => { formik.handleChange(e); parseDescription(e) }}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </div>
                  <div className='col-12 pt-1 pb-3'>
                    <Typography variant="caption">
                      For the card description, you can add mana or tap symbols by putting the symbols between brackets, like {`{tap}, {u} or {x}`}
                    </Typography>
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
                <div className='row'>
                  <div className='col-12'>
                    <Button
                      component="label"
                      variant="contained"
                      tabIndex={-1}
                      size='small'
                      color='success'
                      onClick={() => { downloadAs("jpg") }}
                    >
                      Download file as JPEG
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormikProvider>
        </div>
        <div className='card-renderer col-lg-6 col-md-12'>
          <div className='d-flex p-2 justify-content-center bg-secondary'>
            <TokenCard formik={formik} description={description} image={image} croppedImage={croppedImage} crop={crop} zoom={zoom} setCrop={setCrop} onCropComplete={onCropComplete} setZoom={setZoom} ref={printRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
