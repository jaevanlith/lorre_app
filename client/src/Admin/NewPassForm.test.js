import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPassForm from './NewPassForm';
import api from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { format, addYears } from 'date-fns';

afterEach(cleanup);

describe('Retrieve user', () => {
  beforeEach(() => {
    delete window.location;
  });

  it('displays name correctly', async () => {
    window.location = new URL('https://www.example.com/Admin/NewPassForm/1234');

    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Henk',
      lastName: 'de Bruin',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    const name = await waitFor(() => getByTestId('name'));

    expect(name).toHaveTextContent('Nieuwe pas voor Henk de Bruin');
  });

  it('displays message if no user ID specified', () => {
    window.location = new URL('https://www.example.com/Admin/NewPassForm/');

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    expect(getByTestId('err-msg')).toHaveTextContent('Geen gebruiker gespecificeerd');
  });

  it('displays message if user ID invalid', async () => {
    window.location = new URL('https://www.example.com/Admin/NewPassForm/12');

    const mock = new MockAdapter(api);
    mock.onGet('/users/12').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    const userNotFound = await waitFor(() => getByTestId('err-msg'));
    expect(userNotFound).toHaveTextContent('Gebruiker niet gevonden');
  });

  it('displays message on general error', async () => {
    window.location = new URL('https://www.example.com/Admin/NewPassForm/12');

    const mock = new MockAdapter(api);
    mock.onGet('/users/12').reply(500);

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    const generalMsg = await waitFor(() => getByTestId('err-msg'));
    expect(generalMsg).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('Date fields', () => {
  beforeEach(() => {
    delete window.location;
    window.location = new URL('https://www.example.com/Admin/NewUserForm/1234');

    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Henk',
      lastName: 'de Bruin',
    });
  });

  it('default values set correctly', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    expect(getByTestId('start-date').value).toEqual(format(Date.now(), 'yyyy-MM-dd'));
    expect(getByTestId('end-date').value).toEqual(format(addYears(Date.now(), 1), 'yyyy-MM-dd'));
  });

  it('does not update when start date later than end date', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    userEvent.type(getByTestId('start-date'), '2020-05-20');
    userEvent.type(getByTestId('end-date'), '2021-05-20');
    userEvent.type(getByTestId('start-date'), '2022-05-20');
    expect(getByTestId('start-date').value).toEqual('2020-05-20');
  });

  it('does not update when end date earlier than start date', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );

    userEvent.type(getByTestId('end-date'), '2022-05-20');
    userEvent.type(getByTestId('start-date'), '2021-05-20');
    userEvent.type(getByTestId('end-date'), '2020-05-20');
    expect(getByTestId('end-date').value).toEqual('2022-05-20');
  });
});

describe('Add pass correctly', () => {
  beforeAll(() => {
    delete window.location;
    window.location = {
      pathname: '/Admin/NewUserForm/1234',
      replace: jest.fn(),
    };
  });

  it('mocks `replace`', () => {
    expect(jest.isMockFunction(window.location.replace)).toBe(true);
  });

  it('adds pass correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Henk',
      lastName: 'de Bruin',
    });
    mock.onPost('/tickets/').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('submit'));

    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith('/Admin/UserDetails/1234'));
  });
});

describe('Add pass fail', () => {
  it('displays when add pass failed', async () => {
    delete window.location;
    window.location = new URL('https://www.example.com/Admin/NewUserForm/1234');

    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Henk',
      lastName: 'de Bruin',
    });
    mock.onPost('/tickets/').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassForm />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('submit'));

    const errAddPass = await waitFor(() => getByTestId('err-add-pass'));
    expect(errAddPass).toHaveTextContent('Pas toevoegen mislukt');
  });
});
