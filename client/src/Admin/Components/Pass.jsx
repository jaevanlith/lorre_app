import React, { Component } from 'react';
import {parse, format, parseJSON} from 'date-fns';
import api from '../../utils/API';
import Cropper from "../../Components/Cropper";
import '../stylesheets/Components/Pass.css';

/** Class for displaying a pass to the admin */
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
      type: type(),
      cost: cost(),
      startDate: format(parseJSON(props.startDate), 'dd-MM-yyyy'),
      endDate: format(parseJSON(props.endDate), 'dd-MM-yyyy'),
      image: props.image,
      modifyMode: false,
      modifyErr: '',
      deleted: false,
      deleteErr: '',
      modifyData: {
        startDate: format(parseJSON(props.startDate), 'yyyy-MM-dd'),
        endDate: format(parseJSON(props.endDate), 'yyyy-MM-dd'),
        image: props.image,
      }
    }
  }

  /**
   * This method sets the pass to modify mode.
   */
  modifyMode = () => {
    this.setState({
      modifyMode: true,
    })
  }

  /**
   * This method handles changes in the modify pass form.
   * @param e, e is an event, e.target.id gives the id of the input field, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    let modifyData = this.state.modifyData;
    let id = e.currentTarget.id;
    const val = e.currentTarget.value;

    if (id === '1') {
      if(val < modifyData.endDate) {
        modifyData.startDate = val;
      }
    } else if (id === '2') {
      if(modifyData.startDate < val) {
        modifyData.endDate = val;
      }
    }

    this.setState({ modifyData })
  }

  /**
   * This methods updates the source of the image when cropped.
   * @param img
   */
  handleCropComplete = (img) => {
    let modifyData = this.state.modifyData;
    modifyData.image = img;
    this.setState({ modifyData });
  }

  /**
   * This method cancels modification.
   */
  cancelModification = () => {
    this.setState({
      modifyMode: false,
      modifyErr: '',
      modifyData: {
        startDate: format(parse(this.state.startDate, 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd'),
        endDate: format(parse(this.state.endDate, 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd'),
        image: this.state.image,
      }
    })
  }

  /**
   * This method saves the modified values.
   * @param e
   */
  saveModification = (e) => {
    e.preventDefault();

    api
      .patch('/tickets/' + this.state.passId, {
        startDate: this.state.modifyData.startDate,
        endDate: this.state.modifyData.endDate,
        img: this.state.modifyData.image
      })
      .then((res) => {
        this.setState({
          startDate: format(parseJSON(res.data.startDate), 'dd-MM-yyyy'),
          endDate: format(parseJSON(res.data.endDate), 'dd-MM-yyyy'),
          image: res.data.img,
          modifyMode: false,
          modifyErr: '',
        })
      })
      .catch(() => {
        this.setState({
          modifyErr: 'Pas wijzigen mislukt',
        })
      })
  }

  /**
   * This method deletes the pass.
   */
  deleteAccount = () => {
    api
      .delete('/tickets/' + this.state.passId)
      .then(() => {
        this.setState({
          deleted: true,
        })
      })
      .catch(() => {
        this.setState({
          deleteErr: 'Pas verwijderen mislukt',
        })
      })
  }

 render() {
    return (
      <div className="admin-pass-box">
        {/* Container with the pass information, shown initially */}
        {!this.state.modifyMode && !this.state.deleted && (
          <div data-testid={this.state.passId}>
            {/* Pass information */}
            <p className="admin-pass-title" data-testid="type">{this.state.type}</p>
            <p className="user-detail-label">ID</p>
            <p className="user-detail-val" data-testid="pass-id">{this.state.passId}</p>
            <div style={{display: 'inline-block'}}>
              <p className="user-detail-label">Begin datum</p>
              <p className="user-detail-val" data-testid="start-date">{this.state.startDate}</p>
            </div>
            <div style={{display: 'inline-block', marginLeft: '20px'}}>
              <p className="user-detail-label">Verloopdatum</p>
              <p className="user-detail-val" data-testid="end-date">{this.state.endDate}</p>
            </div>
            <p className="user-detail-label">Kosten</p>
            <p className="user-detail-val" data-testid="cost">{this.state.cost}</p>

            {/* Profile picture attached to pass */}
            <img
              data-testid="image"
              alt='Not available'
              src={this.state.image}
              width='100'
              height='100'
            />

            <br />
            <button className="mod-pass-btn" data-testid="modify-button" onClick={this.modifyMode}>Wijzigen</button>
          </div>
        )}

        {/* Container with form to modify the pass, shown when modify button clicked */}
        {this.state.modifyMode && !this.state.deleted && (
          <div>
            <p className="admin-pass-title" data-testid="mod-type" style={{marginBottom: '20px'}}>{this.state.type}</p>
            <p className="text-center" data-testid="delete-fail">{this.state.deleteErr}</p>
            <form onSubmit={(e) => this.saveModification(e)}>
              <label className="mod-pass-label">Begin datum</label>
              <input className="mod-pass-input" data-testid="mod-start-date" id="1" type="date" onChange={this.handleChange} value={this.state.modifyData.startDate} />
              <br />
              <label className="mod-pass-label">Verloopdatum</label>
              <input className="mod-pass-input" data-testid="mod-end-date" id="2" type="date" onChange={this.handleChange} value={this.state.modifyData.endDate} />
              <br/>
              <label className="mod-pass-label">Foto</label>
              <Cropper src={this.state.modifyData.image} onCropComplete={this.handleCropComplete}/>
              <br/>
              <p data-testid="save-fail">{this.state.modifyErr}</p>
              <button className="mod-save-btn" data-testid="save-button" type="submit">
                <span className=" fa fa-save" style={{marginRight: '10px'}} />
                Opslaan
              </button>
            </form>

            <button className="mod-cancel-btn" data-testid="cancel-button" onClick={this.cancelModification}>
              <span className=" fa fa-times" style={{marginRight: '10px'}} />
               Annuleren
            </button>
            <button className="mod-delete-btn" data-testid="delete-button" onClick={this.deleteAccount}>
              <span className=" fa fa-trash" style={{marginRight: '10px'}} />
               Verwijderen
            </button>
          </div>
        )}

        {/*Container with message when pass is deleted*/}
        {this.state.deleted && <p className="text-center" data-testid="deleted">Pas succesvol verwijderd</p>}
      </div>);
  }
}

export default Pass;
