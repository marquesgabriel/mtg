import { forwardRef, useLayoutEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import moment from 'moment';
import { parseManaSymbols } from '../../utils';
import './index.scss';

const DESCRIPTION_BASE_FONT_SIZE_PT = 9.5;
const DESCRIPTION_MIN_FONT_SIZE_PT = 6;
const DESCRIPTION_FONT_STEP_PT = 0.5;

const TokenCard = forwardRef(
  (
    {
      formik,
      image,
      croppedImage,
      crop,
      zoom,
      setCrop,
      onCropComplete,
      setZoom,
      description,
      id = 'card-element',
    }: any,
    ref: any,
  ) => {
    const descriptionBoxRef = useRef<HTMLDivElement>(null);
    const descriptionContentRef = useRef<HTMLDivElement>(null);

    // Shrinks the description font until it fits the fixed-height box instead
    // of overflowing and breaking the card layout (measures real DOM overflow
    // rather than estimating from character count, since mana/tap icons take
    // up space that character count alone doesn't capture). Re-runs once
    // document.fonts.ready resolves because the initial pass can measure
    // against fallback-font metrics on a cold cache, then never re-shrink
    // once the custom @font-face swaps in and changes scrollHeight.
    useLayoutEffect(() => {
      const box = descriptionBoxRef.current;
      const content = descriptionContentRef.current;
      if (!box || !content) return;

      let cancelled = false;

      const shrinkToFit = () => {
        if (cancelled) return;
        let fontSize = DESCRIPTION_BASE_FONT_SIZE_PT;
        content.style.fontSize = `${fontSize}pt`;

        while (content.scrollHeight > box.clientHeight && fontSize > DESCRIPTION_MIN_FONT_SIZE_PT) {
          fontSize -= DESCRIPTION_FONT_STEP_PT;
          content.style.fontSize = `${fontSize}pt`;
        }
      };

      shrinkToFit();
      // document.fonts is unimplemented in the jsdom version this repo's test
      // suite runs on (jsdom 16), unlike every real target browser.
      if (document.fonts) {
        document.fonts.ready.then(shrinkToFit);
      }

      return () => {
        cancelled = true;
      };
    }, [description]);

    return (
      <div
        ref={ref}
        id={id}
        className={`card-wrapper ${formik.values.cardBorder}-border ${formik.values.cardColor}`}
      >
        <div className={`card-inner`}>
          <div
            className={formik.values.cardImageSize === 'classic' ? `card-image` : `card-image-full`}
          >
            <div className="image-inner">
              {croppedImage ? (
                <img src={croppedImage} alt="cropped item by user" className="rendered-crop" />
              ) : (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={formik.values.cardImageSize === 'classic' ? 54 / 43.5 : 63.5 / 85.5} // this is for classic
                  objectFit="cover"
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
          </div>
          <div className={`texture ${formik.values.cardTexture}`}></div>
          <div className="card-name rounded-sides-inset">
            <div>{formik.values.name}</div>
          </div>
          {formik.values.manaCost && (
            <div
              className="card-mana-cost"
              dangerouslySetInnerHTML={{ __html: parseManaSymbols(formik.values.manaCost) }}
            />
          )}
          <div
            className={`card-type rounded-sides-inset ${!formik.values.description ? 'descriptionless' : ''}`}
          >
            <div className="ps-2">
              {formik.values.superType ? `${formik.values.superType} ` : null}
              {formik.values.type} {formik.values.subType ? ` - ${formik.values.subType}` : null}
            </div>
          </div>
          {description && (
            <div className="card-description" ref={descriptionBoxRef}>
              <div ref={descriptionContentRef} dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          )}
          {formik.values.power ? (
            <div className="card-pw rounded-sides-inset">
              <div>
                {formik.values.power}/{formik.values.toughness}
              </div>
            </div>
          ) : null}
          <div className="card-footer">
            <div className="d-flex justify-content-between">
              <p className="text-left">
                A01{' '}
                {formik.values.artist ? (
                  <i className={`ms ms-text ms-artist-nib ${formik.values.cardBorder}`} />
                ) : null}{' '}
                {formik.values.artist && formik.values.artist}
              </p>
              <p className="text-right">not © {moment().year()} Artificialis</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

TokenCard.displayName = 'TokenCard';

export default TokenCard;
