import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import NewPassword from './NewPassword';
import userEvent from '@testing-library/user-event';

// Mock Menu component as it is not relevant to this unit test
jest.mock('./Components/Menu.js', () => () => <div />);

afterEach(cleanup);

describe('Rendering and functioning correctly', () => {
  it('displays correctly', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassword />
      </BrowserRouter>
    );

    const screen = getByTestId('screen');

    expect(screen).not.toHaveTextContent('Er is iets misgegaan');
    expect(screen).toHaveTextContent('Herstel wachtwoord');
    expect(screen).toHaveTextContent('Stel in');
  });

  it('displays correctly after success', async () => {
    delete window.location;
    window.location = { search: '?token=1234' };

    expect(window.location.search).toEqual('?token=1234');
    const mock = new MockAdapter(API);
    let jsonObject = { password: 'FineLine1' };
    mock.onPost('/auth/reset-password?token=1234', jsonObject).reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassword />
      </BrowserRouter>
    );

    userEvent.type(await waitFor(() => getByTestId('password')), 'FineLine1');
    userEvent.type(await waitFor(() => getByTestId('passwordRepeat')), 'FineLine1');
    userEvent.click(await waitFor(() => getByTestId('submit')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Gelukt!');
    expect(screen).toHaveTextContent('Je wachtwoord is gewijzigd.');
    expect(screen).toHaveTextContent('Ga terug naar de startpagina om in te loggen');
  });
});

describe('Errors function properly', () => {
  it('new passwords do not match', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassword />
      </BrowserRouter>
    );
    const screen = getByTestId('screen');
    userEvent.type(getByTestId('password'), 'kat');
    userEvent.type(getByTestId('passwordRepeat'), 'hond');
    userEvent.click(getByTestId('submit'));
    expect(screen).toHaveTextContent('Wachtwoorden komen niet overeen');
  });

  it('other error', async () => {
    delete window.location;
    window.location = { search: '?token=1234' };

    expect(window.location.search).toEqual('?token=1234');
    const mock = new MockAdapter(API);
    mock
      .onPost('/auth/reset-password?token=1234', { password: 'FineLine1' })
      .reply(400, { message: 'password reset failed' });
    const { getByTestId } = render(
      <BrowserRouter>
        <NewPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('submit')));
    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Er is iets misgegaan');
    expect(screen).toHaveTextContent('Waarschijnlijk is je link verlopen,');
    expect(screen).toHaveTextContent('vraag een nieuwe aan!');
  });
});
