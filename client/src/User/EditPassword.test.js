import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import EditPassword from './EditPassword';
import userEvent from '@testing-library/user-event';

// Mock LiveCount component as it is not relevant to this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

afterEach(cleanup);

describe('Rendering and functioning correctly', () => {
  it('displays correctly', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    const screen = getByTestId('screen');

    expect(screen).not.toHaveTextContent('Er is iets misgegaan');
    expect(screen).toHaveTextContent('Wachtwoord wijzigen');
    expect(screen).toHaveTextContent('Wijzigen');
  });

  it('displays correctly after success', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onPatch('/users/changePassword/1234').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('change')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Je wachtwoord is succesvol gewijzigd');
  });
});

describe('Errors function properly', () => {
  it('wrong current password', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onPatch('/users/changePassword/1234').reply(400, { message: 'Incorrect password' });

    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('change')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Je huidige wachtwoord is incorrect');
  });

  it('new passwords do not match', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    const screen = getByTestId('screen');
    userEvent.type(getByTestId('current'), 'aap');
    userEvent.type(getByTestId('newOne'), 'kat');
    userEvent.type(getByTestId('newTwo'), 'hond');
    userEvent.click(getByTestId('change'));

    expect(screen).toHaveTextContent('Wachtwoorden komen niet overeen');
  });

  it('too short new password', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onPatch('/users/changePassword/1234').reply(400, { message: 'password must be at least 8 characters' });

    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('change')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Wachtwoord moet tenminste 8 tekens bevatten');
  });

  it('other error', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onPatch('/users/changePassword/1234').reply(400, { message: 'BlaBlaBla' });

    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('change')));
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('visibility password', () => {
  it('password has type password', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );
    expect(getByTestId('current').type).toEqual('password');
    expect(getByTestId('newOne').type).toEqual('password');
    expect(getByTestId('newTwo').type).toEqual('password');
  });

  it('old password becomes visible on click new passwords stay invisible', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('visibilityOld'));
    expect(getByTestId('current').type).toEqual('text');
    expect(getByTestId('newOne').type).toEqual('password');
    expect(getByTestId('newTwo').type).toEqual('password');
  });

  it('new passwords become visible on click old password stays invisible', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('visibilityNew'));
    expect(getByTestId('current').type).toEqual('password');
    expect(getByTestId('newOne').type).toEqual('text');
    expect(getByTestId('newTwo').type).toEqual('text');
  });

  it('password is invisible on two clicks', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <EditPassword />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('visibilityOld'));
    userEvent.click(getByTestId('visibilityNew'));
    userEvent.click(getByTestId('visibilityOld'));
    userEvent.click(getByTestId('visibilityNew'));
    expect(getByTestId('current').type).toEqual('password');
    expect(getByTestId('newOne').type).toEqual('password');
    expect(getByTestId('newTwo').type).toEqual('password');
  });
});
