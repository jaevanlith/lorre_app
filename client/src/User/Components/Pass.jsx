import React, { Component } from 'react';
import QRCode from "qrcode.react";
import { parseJSON, format } from 'date-fns';
import '../stylesheets/Components/Pass.css';

/** Class for displaying a pass to a user */
class Pass extends Component {

  /**
   * This method assigns values to the states
   */
  constructor(props){
    super(props);

    const type = () => {
      if(props.type === 'year') return 'Jaarpas';
      else return 'Dagpas';
    }

    const cost = () => {
      if(props.type === 'year') return '€8,50';
      else return '€2,00';
    }

    this.state = {
      passId: props.passId,
      firstName: props.firstName,
      lastName: props.lastName,
      type: type(),
      cost: cost(),
      endDate: format(parseJSON(props.endDate), 'dd-MM-yyyy'),
      image: props.image,
      imageSize: 50,
      qrSize: 200,
    }
  }

  /**
   * This method expands the image and shrinks QR code
   */
  expandImage = () => {
    this.setState({
      imageSize: 200,
      qrSize: 50
    })
  }

  /**
   * This method expands QR code and shrinks image
   */
  expandQR = () => {
    this.setState({
      imageSize: 50,
      qrSize: 200
    })
  }

  render() {
    return (
      <div className="pass-container" data-testid={this.state.passId}>
        {/* Pass information */}
        <div className="pass-text-bg">
          <div className="pass-text">
            <h2 className="pass-title" data-testid="type">{this.state.type}</h2>
            <div className="end-date">
              <p className="pass-label">Verloopdatum</p>
              <p className="pass-value" data-testid="end-date">{this.state.endDate}</p>
            </div>
            <div className="cost">
              <p className="pass-label">Kosten</p>
              <p className="pass-value" data-testid="cost">{this.state.cost}</p>
            </div>
            <div className="owner">
              <p className="pass-label">Eigenaar</p>
              <p className="pass-value" data-testid="owner">{this.state.firstName} {this.state.lastName}</p>
            </div>
          </div>
        </div>

        <div className="pass-qr-bg">
          <div className="pass-qr">
            {/* QR code generator component */}
            <QRCode
              value={this.state.passId}
              size={this.state.qrSize}
              onClick={this.expandQR}
            />

            {/* Profile picture attached to pass */}
            <img
              className="pass-picture"
              data-testid="image"
              alt='Not available'
              src={this.state.image}
              width={this.state.imageSize}
              height={this.state.imageSize}
              onClick={this.expandImage}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Pass;
