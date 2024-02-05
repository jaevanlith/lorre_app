import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

class Cropper extends Component {
  state = {
    src: this.props.src,
    crop: {
      unit: '%',
      width: 100,
      aspect: 1 / 1,
    },
  };

  /**
   * This methods reads the file.
   * @param e
   */
  onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => this.setState({ src: reader.result }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  /**
   * This methods loads the image.
   * @param image
   */
  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  /**
   * This method sets the crop properties.
   * @param crop
   */
  onCropChange = (crop) => {
    this.setState({ crop });
  };

  /**
   * This method sets the cropped image.
   * @param crop
   */
  onCropComplete = (crop) => {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = this.getCroppedImg(this.imageRef, crop);
      this.props.onCropComplete(croppedImageUrl);
    }
  };

  /**
   * This method creates a new image of the selected part.
   * @param image
   * @param crop
   * @returns {string | void}
   */
  getCroppedImg(image, crop) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return canvas.toDataURL('image/jpeg');
  }

  render() {
    return (
      <div>
        <div>
          <input type="file" accept="image/*" onChange={this.onSelectFile} />
        </div>
        {this.state.src && (
          <ReactCrop
            src={this.state.src}
            crop={this.state.crop}
            ruleOfThirds
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
            style={{ maxWidth: 200 }}
          />
        )}
      </div>
    );
  }
}

export default Cropper;
