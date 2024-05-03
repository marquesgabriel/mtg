import Cropper from "react-easy-crop";
import './index.scss';

const TokenCard = ({ formik, image, crop, zoom, setCrop, onCropComplete, setZoom, description }: any) => {
  return (<div className='card-wrapper'>
    <div className='card-inner white'>
      <div className='card-image'>
        <div className='image-inner'>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            // aspect={3.1 / 4} // this is for full art
            aspect={1.3 / 1} // this is for classic
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
      <div className='card-type rounded-sides-inset'>
        <div>
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
        <div>
          2024
        </div>
      </div>
    </div>
  </div>)
}

export default TokenCard