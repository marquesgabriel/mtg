import Cropper from "react-easy-crop";
import moment from 'moment';
import './index.scss';

const TokenCard = ({ formik, image, crop, zoom, setCrop, onCropComplete, setZoom, description }: any) => {
  return (<div className={`card-wrapper ${formik.values.cardBorder}-border ${formik.values.cardColor}`}>
    <div className={`card-inner`}>
      <div className={formik.values.cardImageSize === 'classic' ? `card-image` : `card-image-full`}>
        <div className='image-inner'>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={formik.values.cardImageSize === 'classic' ? (1.3 / 1) : (3.1 / 4)} // this is for classic
            objectFit='cover'
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      </div>
      <div className='card-name rounded-sides-inset'>
        <div>
          {formik.values.name}
        </div>
      </div>
      <div className={`card-type rounded-sides-inset ${!formik.values.description ? 'descriptionless' : ''}`}>
        <div className="ps-2">
          {formik.values.superType ? `${formik.values.superType} ` : null}{formik.values.type} {formik.values.subType ? ` - ${formik.values.subType}` : null}
        </div>
      </div>
      {description && <div className='card-description'>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>}
      {formik.values.power ? <div className='card-pw rounded-sides-inset'>
        <div>
          {formik.values.power}/{formik.values.toughness}
        </div>
      </div> : null}
      <div className='card-footer'>
        <div className="d-flex justify-content-between">
          <p className="text-left">
            A01 {formik.values.artist ? <i className={`ms ms-text ms-artist-nib ${formik.values.cardBorder}`} /> : null} {formik.values.artist && formik.values.artist}
          </p>
          <p className="text-right">
            not © {moment().year()} Artificialis
          </p>
        </div>
      </div>
    </div>
  </div>)
}

export default TokenCard