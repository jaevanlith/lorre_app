import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import userEvent from '@testing-library/user-event';

// Mock Menu component as it is not relevant to this unit test
jest.mock('./Components/Menu.js', () => () => <div />);

afterEach(cleanup);

describe('Rendering and functioning correctly', () => {
  it('displays correctly', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    const screen = getByTestId('screen');

    expect(screen).not.toHaveTextContent('Er is iets misgegaan');
    expect(screen).toHaveTextContent('Herstel je wachtwoord');
    expect(screen).toHaveTextContent(
      'Vul je e-mailadres in, er zal een e-mail verstuurd worden met een link om je wachtwoord te herstellen.'
    );
  });

  it('displays correctly after success', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/forgot-password').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('send')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Er is een email verstuurd. Check ook je spam.');
  });
});

describe('errors correctly', () => {
  it('cannot find email', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/forgot-password').reply(404);

    const { getByTestId } = render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('send')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Dit e-mailadres staat niet in ons systeem');
  });

  it('other error', async () => {
    const mock = new MockAdapter(API);
    mock.onPost('/auth/forgot-password').reply(400, { message: 'BlaBlaBla' });

    const { getByTestId } = render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('send')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });
});
