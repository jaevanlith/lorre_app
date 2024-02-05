import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/Components/UserPreview.css';

/**Class for displaying a user account to the admin */
class UserPreview extends Component {
  state = {
    userId: this.props.userId,
    firstName: this.props.firstName,
    lastName: this.props.lastName,
    email: this.props.email,
  };
  render() {
    return (
      <Link to={'/Admin/UserDetails/' + this.state.userId}>
        <div className="userprev-box" data-testid={this.state.userId}>
          <p className="userprev-name" data-testid="name">
            {this.state.firstName} {this.state.lastName}
          </p>
          <p className="userprev-email" data-testid="email">
            {this.state.email}
          </p>
        </div>
      </Link>
    );
  }
}

export default UserPreview;
