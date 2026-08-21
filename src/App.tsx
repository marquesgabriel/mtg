import { useEffect, useRef, useState } from 'react';
import { Point, Area } from "react-easy-crop";
import { useFormik, FormikProvider } from 'formik';
import * as yup from "yup";
import domtoimage from 'dom-to-image';
import Divider from '@mui/material/Divider';

import './App.scss';
import TokenCard from './Card';
import getCroppedImg from './utils/cropper';
import { parseManaSymbols } from './utils/manaSymbols';
import SupportSidebar from './SupportSidebar';
import CardStyleSection from './CardStyleSection';
import ImageUploadSection from './ImageUploadSection';
import CardDataSection from './CardDataSection';
import Container from './Container';

// Only text/selection fields are persisted — the uploaded image/crop is a
// blob URL (URL.createObjectURL) that doesn't survive a reload, so it's
// intentionally left out (see issue #3).
const DRAFT_STORAGE_KEY = 'mtg-token-generator:draft';
const PERSISTED_FIELDS = [
  'name', 'superType', 'type', 'subType', 'description', 'artist', 'manaCost',
  'power', 'toughness', 'cardBorder', 'cardTexture', 'cardColor', 'cardImageSize',
] as const;

function loadDraft(): Partial<Record<typeof PERSISTED_FIELDS[number], string>> {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraft(values: Record<string, any>) {
  try {
    const toSave: Record<string, any> = {};
    PERSISTED_FIELDS.forEach((field) => { toSave[field] = values[field]; });
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — degrade silently
  }
}

const DEFAULT_IMAGE = "https://images.theconversation.com/files/123291/original/image-20160520-4451-87u0j1.jpg";

const DEFAULT_VALUES = {
  name: "rat",
  superType: "token",
  type: "creature",
  subType: "rat",
  description: "",
  manaCost: "",
  artist: "",
  power: "1",
  toughness: "1",
  image: "",
  cardBorder: "black",
  cardTexture: "texture6",
  cardColor: "black",
  cardImageSize: "full-art",
};

function App() {
  const initialDraft = loadDraft();

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState<any>(null);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const printRef = useRef<any>();
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  };
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [description, setDescription] = useState(() => parseManaSymbols(initialDraft.description ?? ""));

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

  // dom-to-image has no "scale" option — without width/height it captures
  // the element at on-screen CSS pixel size (~96dpi), which is far too low
  // resolution for print. We render at PRINT_DPI instead by scaling the
  // cloned node up before capture (fixed, not user-configurable).
  const PRINT_DPI = 300;
  const SCREEN_DPI = 96;

  const downloadAs = (ext: string) => {
    const node: any = document.getElementById("card-element");
    const scale = PRINT_DPI / SCREEN_DPI;
    const printOptions = {
      quality: 1,
      bgcolor: "#000",
      width: node.offsetWidth * scale,
      height: node.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`,
      },
    };

    switch (ext) {
      case 'svg':
        // Vector output is already resolution-independent — no scaling needed.
        domtoimage.toSvg(node, { quality: 1, bgcolor: "#000" })
          .then(function (dataUrl: string) {
            var link = document.createElement('a');
            link.download = 'exported-card.svg';
            link.href = dataUrl;
            link.click();
          });
        break;
      case 'jpeg':
        domtoimage.toJpeg(node, printOptions)
          .then(function (dataUrl: string) {
            var link = document.createElement('a');
            link.download = 'exported-card.jpeg';
            link.href = dataUrl;
            link.click();
          });
        break;
      case 'png':
        domtoimage.toPng(node, printOptions)
          .then(function (dataUrl: string) {
            var link = document.createElement('a');
            link.download = 'exported-card.png';
            link.href = dataUrl;
            link.click();
          });
        break;
      default:
        break;
    }
  }

  const parseDescription = (e: any) => {
    setDescription(parseManaSymbols(e.target.value));
  }

  const form = yup.object({
    name: yup.string().required("This field is required"),
    superType: yup.string().nullable(),
    type: yup.string().required("This field is required"),
    subType: yup.string().nullable(),
    description: yup.string().nullable(),
    manaCost: yup.string().nullable(),
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
      ...DEFAULT_VALUES,
      ...initialDraft,
    },
    validationSchema: form,
    // No real submit action — exporting the card happens via DownloadAsButton,
    // not this form. Kept as a no-op (rather than removing <form>/onSubmit
    // entirely) so formik.handleSubmit still preventDefaults an Enter-key
    // submit in a text field, avoiding a full page reload.
    onSubmit: () => {},
  });

  // Debounced auto-save of the text/selection fields (see loadDraft/saveDraft above).
  useEffect(() => {
    const handle = setTimeout(() => saveDraft(formik.values), 400);
    return () => clearTimeout(handle);
  }, [formik.values]);

  const handleReset = () => {
    if (!window.confirm('Reset the form to its default values? This cannot be undone.')) {
      return;
    }

    formik.resetForm({ values: DEFAULT_VALUES });

    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // localStorage unavailable — nothing to clear
    }

    setImage(DEFAULT_IMAGE);
    setCroppedImage(null);
    setDescription('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handlePickedImage = (event: any) => {
    setCroppedImage(null);
    setImage(URL.createObjectURL(event.target.files[0]))
  }

  return (
    <div className='container'>
      <div className="row gy-4">
        <div className="card-inputs col-lg-5 col-md-12">
          <Container title="MTG Token Generator">
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit}>
                <CardStyleSection formik={formik} />
                <Divider />
                <ImageUploadSection
                  formik={formik}
                  zoom={zoom}
                  setZoom={setZoom}
                  cropMyImage={cropMyImage}
                  handlePickedImage={handlePickedImage}
                />
                <Divider />
                <CardDataSection
                  formik={formik}
                  parseDescription={parseDescription}
                  downloadAs={downloadAs}
                  handleReset={handleReset}
                />
              </form>
            </FormikProvider>
          </Container>
        </div>
        <div className='card-renderer col-lg-5 col-md-12'>
          <Container title="Preview" classes="h-100">
            <div className='d-flex p-2 justify-content-center bg-secondary h-100 align-items-center'>
              <TokenCard formik={formik} description={description} image={image} croppedImage={croppedImage} crop={crop} zoom={zoom} setCrop={setCrop} onCropComplete={onCropComplete} setZoom={setZoom} ref={printRef} />
            </div>
          </Container>
        </div>
        <div className='col-lg-2 col-md-12'>
          <Container title="Support" barButtons="close-only">
            <SupportSidebar />
          </Container>
        </div>
      </div>
    </div>
  );
}

export default App;
