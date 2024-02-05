import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import UserPreview from './Components/UserPreview';
import api from './../utils/API';
import Menu from './Components/Menu';
import './stylesheets/Catalog.css';

/**Class for catalog screen, where the admin can search for user accounts */
class Catalog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      results: [],
      loading: false,
      err: false,
      winWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  /**
   * This method keeps track of the window size to distinguish desktop and mobile users.
   */
  handleWindowSizeChange = () => {
    this.setState({ winWidth: window.innerWidth });
  };

  /**
   * This method updates the query and triggers fetchSearchResults on changes in the search bar.
   * @param {*} e, e is an event, e.target.value gets the value of the input field
   */
  handleChange = (e) => {
    const query = e.target.value;

    if (!query) {
      this.setState({
        query: '',
        results: [],
      });
    } else {
      this.setState(
        {
          query,
          loading: true,
        },
        () => {
          this.fetchSearchResults(query);
        }
      );
    }
  };

  /**
   * This method retrieves the search results.
   * @param query the search query
   */
  fetchSearchResults = (query) => {
    api
      .get('/users/search/inclusive?keyword=' + query)
      .then((res) => {
        this.setState({
          results: res.data,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          err: true,
          loading: false,
        });
      });
  };

  render() {
    const result = () => {
      if (this.state.results.length) {
        return this.state.results.map((user) => (
          <UserPreview
            key={user.id}
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
          />
        ));
      } else if (this.state.query) {
        return (
          <p className="text" data-testid="no-results">
            Geen resultaten voor '{this.state.query}'
          </p>
        );
      }
    };

    const isMobile = this.state.winWidth <= 600;
    let desktop = '';
    if (!isMobile) {
      desktop = 'catalog-desktop';
    }

    return (
      <div>
        <Menu />

        <div className={desktop}>
          <input
            className="search-bar"
            data-testid="search-bar"
            placeholder="Zoek gebruikers..."
            onChange={this.handleChange}
          />

          <Link to="/Admin/NewUserForm">
            <button className="add-user fa fa-user-plus" />
          </Link>

          {!this.state.err && !this.state.loading && result()}
          {!this.state.err && this.state.loading && (
            <p className="text" data-testid="loading">
              Laden...
            </p>
          )}
          {this.state.err && (
            <div className="error-catalog">
              <span className="fa fa-exclamation-triangle triangle-catalog" />
              <p className="text error-text-catalog" data-testid="err-message">
                Zoeken mislukt
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Catalog;
