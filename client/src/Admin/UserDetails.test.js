import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import api from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import UserDetails from './UserDetails';

beforeEach(() => {
  delete window.location;
});
afterEach(cleanup);

describe('Correct user requests', () => {
  it('displays user details correctly', async () => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/1234');

    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const name = await waitFor(() => getByTestId('name'));
    const admin = await waitFor(() => getByTestId('admin'));
    const id = await waitFor(() => getByTestId('id'));
    const email = await waitFor(() => getByTestId('email'));
    const dateOfBirth = await waitFor(() => getByTestId('date-of-birth'));
    const city = await waitFor(() => getByTestId('city'));
    const university = await waitFor(() => getByTestId('university'));

    expect(name).toHaveTextContent('Henk de Bruin');
    expect(admin).not.toHaveTextContent();
    expect(id).toHaveTextContent('1234');
    expect(email).toHaveTextContent('email@email.com');
    expect(dateOfBirth).toHaveTextContent('16-12-2020');
    expect(city).toHaveTextContent('Delft');
    expect(university).toHaveTextContent('TU Delft');
  });

  it('displays admin correctly', async () => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/1234');

    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'admin',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const admin = await waitFor(() => getByTestId('admin'));
    expect(admin).toHaveTextContent('Beheerder');
  });
});

describe('Incorrect/failed user requests', () => {
  it('displays message if no user ID specified', () => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/');

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    expect(getByTestId('err-user-msg')).toHaveTextContent('Geen gebruiker gespecificeerd');
  });

  it('displays message if user ID invalid', async () => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/12');

    const mock = new MockAdapter(api);
    mock.onGet('/users/12').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const userNotFound = await waitFor(() => getByTestId('err-user-msg'));
    expect(userNotFound).toHaveTextContent('Gebruiker niet gevonden');
  });

  it('displays message on general error', async () => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/12');

    const mock = new MockAdapter(api);
    mock.onGet('/users/12').reply(500);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const generalMsg = await waitFor(() => getByTestId('err-user-msg'));
    expect(generalMsg).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('Pass requests', () => {
  beforeEach(() => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/1234');
  });

  it('displays user passes correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });
    mock.onGet('/tickets/get/1234').reply(200, [
      {
        userId: '1234',
        type: 'year',
        startDate: '2020-12-23T22:57:42.572Z',
        endDate: '2021-12-23T22:57:42.572Z',
        img: 'source',
        id: '5fe3',
      },
    ]);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const pass = await waitFor(() => getByTestId('5fe3'));
    expect(pass).toBeVisible();
  });

  it('displays message when no passes', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });
    mock.onGet('/tickets/get/1234').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const noPassMsg = await waitFor(() => getByTestId('no-passes'));
    expect(noPassMsg).toHaveTextContent('Geen passen');
  });

  it('displays message on error', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });
    mock.onGet('/tickets/get/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    const errMsg = await waitFor(() => getByTestId('err-pass-msg'));
    expect(errMsg).toHaveTextContent('Passen ophalen mislukt');
  });
});

describe('Delete account', () => {
  beforeEach(() => {
    window.location = new URL('https://www.example.com/Admin/UserDetails/1234');
  });

  it('enables delete button on box checked', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('checkbox'));
    expect(getByTestId('delete-btn')).toBeEnabled();
  });

  it('deletes account correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });
    mock.onGet('/tickets/get/1234').reply(200, []);
    mock.onDelete('/users/1234').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('checkbox'));
    userEvent.click(getByTestId('delete-btn'));

    const msg = await waitFor(() => getByTestId('err-user-msg'));
    expect(msg).toHaveTextContent('Account verwijderd');
  });

  it('displays message when delete account failed', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      role: 'user',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
      dateOfBirth: '2020-12-16T21:11:08.604Z',
      city: 'Delft',
      university: 'TU Delft',
    });
    mock.onGet('/tickets/get/1234').reply(200, []);
    mock.onDelete('/users/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <UserDetails />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('checkbox'));
    userEvent.click(getByTestId('delete-btn'));

    const msg = await waitFor(() => getByTestId('err-user-msg'));
    expect(msg).toHaveTextContent('Account verwijderen mislukt');
  });
});
