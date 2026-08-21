import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Point, Area } from "react-easy-crop";
import { useFormik, FormikProvider } from 'formik';
import * as yup from "yup";
import domtoimage from 'dom-to-image';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import './App.scss';
import TokenCard from './Card';
import getCroppedImg from './utils/cropper';
import { parseManaSymbols } from './utils/manaSymbols';
import { safeStorageGet, safeStorageSet, safeStorageRemove } from './utils/safeStorage';
import { DEFAULT_TOKEN_VALUES as DEFAULT_VALUES, TOKEN_FIELD_KEYS as PERSISTED_FIELDS } from './utils/tokenFields';
import { serializeToken, isValidTokenFile, tokenValuesFromFile } from './utils/tokenFile';
import { GalleryEntry, loadGallery, addToGallery, removeFromGallery, updateGalleryEntryCopies } from './utils/gallery';
import SupportSidebar from './SupportSidebar';
import CardStyleSection from './CardStyleSection';
import ImageUploadSection from './ImageUploadSection';
import CardDataSection from './CardDataSection';
import GalleryDialog from './GalleryDialog';
import Container from './Container';

const DRAFT_STORAGE_KEY = 'mtg-token-generator:draft';
const DEFAULT_IMAGE = "https://images.theconversation.com/files/123291/original/image-20160520-4451-87u0j1.jpg";

function loadDraft(): Partial<Record<typeof PERSISTED_FIELDS[number], string>> {
  try {
    const raw = safeStorageGet(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraft(values: Record<string, any>) {
  const toSave: Record<string, any> = {};
  PERSISTED_FIELDS.forEach((field) => { toSave[field] = values[field]; });
  safeStorageSet(DRAFT_STORAGE_KEY, JSON.stringify(toSave));
}

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
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [gallery, setGallery] = useState<GalleryEntry[]>(() => loadGallery());
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Applies the current crop/zoom selection, replacing the interactive
  // Cropper (react-easy-crop) with the cropped result in the preview. Runs
  // automatically before every export (see downloadAs) instead of requiring
  // a separate manual "Confirm image crop" step - exporting without
  // confirming used to bake the Cropper's own grid/handles into the
  // exported card (#72). flushSync forces the resulting <img> to be in the
  // DOM before downloadAs captures #card-element, since a plain setState
  // wouldn't be guaranteed to re-render in time.
  const ensureCropped = async () => {
    if (croppedImage) return;
    try {
      const croppedProduct = await getCroppedImg(
        image,
        croppedArea,
        0 // this is the rotation value
      )
      flushSync(() => setCroppedImage(croppedProduct));
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

  const downloadAs = async (ext: string) => {
    await ensureCropped();

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

    // Mobile browsers (especially iOS Safari) give no visible confirmation
    // that a download happened - the snackbar below is that feedback,
    // shown once the file is actually ready rather than optimistically on
    // click (#71).
    const triggerDownload = (dataUrl: string, filename: string) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      setFeedback({ message: 'Download started', severity: 'success' });
    };

    switch (ext) {
      case 'svg':
        // Vector output is already resolution-independent — no scaling needed.
        domtoimage.toSvg(node, { quality: 1, bgcolor: "#000" })
          .then((dataUrl: string) => triggerDownload(dataUrl, 'exported-card.svg'));
        break;
      case 'jpeg':
        domtoimage.toJpeg(node, printOptions)
          .then((dataUrl: string) => triggerDownload(dataUrl, 'exported-card.jpeg'));
        break;
      case 'png':
        domtoimage.toPng(node, printOptions)
          .then((dataUrl: string) => triggerDownload(dataUrl, 'exported-card.png'));
        break;
      default:
        break;
    }
  }

  const parseDescription = (e: any) => {
    setDescription(parseManaSymbols(e.target.value));
  }

  // Exports the current form fields (not the image - see utils/tokenFields)
  // as a downloadable JSON file, so a token-in-progress can be picked back
  // up later without redoing the whole form (#6). Complements the
  // localStorage draft, which only survives in this browser.
  const saveAsJson = () => {
    const file = serializeToken(formik.values);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${formik.values.name || 'token'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setFeedback({ message: 'Token saved as JSON', severity: 'success' });
  };

  const loadFromJson = (event: any) => {
    const inputFile = event.target.files[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!inputFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!isValidTokenFile(parsed)) {
          setFeedback({ message: 'That file is not a valid token JSON', severity: 'error' });
          return;
        }
        const values = tokenValuesFromFile(parsed);
        formik.setValues({ ...formik.values, ...values });
        setDescription(parseManaSymbols(values.description));
        setFeedback({ message: 'Token loaded from JSON', severity: 'success' });
      } catch {
        setFeedback({ message: 'That file is not a valid token JSON', severity: 'error' });
      }
    };
    reader.readAsText(inputFile);
  };

  // The gallery (#7) is a separate, in-app persisted list of tokens -
  // unlike JSON save/load (#6), no file dialog is involved, and each entry
  // tracks a "copies" count consumed by the print-sheet feature (#10).
  const saveToGallery = () => {
    const { token } = serializeToken(formik.values);
    setGallery(addToGallery(token));
    setFeedback({ message: 'Saved to gallery', severity: 'success' });
  };

  const loadGalleryEntry = (entry: GalleryEntry) => {
    formik.setValues({ ...formik.values, ...entry.token });
    setDescription(parseManaSymbols(entry.token.description));
    setGalleryOpen(false);
    setFeedback({ message: 'Token loaded from gallery', severity: 'success' });
  };

  const deleteGalleryEntry = (id: string) => {
    setGallery(removeFromGallery(id));
  };

  const changeGalleryEntryCopies = (id: string, copies: number) => {
    setGallery(updateGalleryEntryCopies(id, copies));
  };

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
    safeStorageRemove(DRAFT_STORAGE_KEY);

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
                  handlePickedImage={handlePickedImage}
                />
                <Divider />
                <CardDataSection
                  formik={formik}
                  parseDescription={parseDescription}
                  downloadAs={downloadAs}
                  handleReset={handleReset}
                  saveAsJson={saveAsJson}
                  loadFromJson={loadFromJson}
                  saveToGallery={saveToGallery}
                  openGallery={() => setGalleryOpen(true)}
                  galleryCount={gallery.length}
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
      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setFeedback(null)} severity={feedback?.severity ?? 'success'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
      <GalleryDialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        entries={gallery}
        onLoad={loadGalleryEntry}
        onDelete={deleteGalleryEntry}
        onCopiesChange={changeGalleryEntryCopies}
      />
    </div>
  );
}

export default App;
