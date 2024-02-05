import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import api from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';

// Mock LiveCount component as it is not relevant to this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

afterEach(cleanup);

describe('Incorrect login', () => {
  it('displays message when login credentials incorrect', async () => {
    const mock = new MockAdapter(api);
    mock.onPost('/auth/login').reply(401, {
      code: 401,
      message: 'Incorrect email or password',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('login-button'));

    const failMessage = await waitFor(() => getByTestId('fail-message'));

    expect(failMessage).toHaveTextContent('E-mail en/of wachtwoord incorrect');
  });

  it('displays message on error', async () => {
    const mock = new MockAdapter(api);
    mock.onPost('/auth/login').reply(502, {
      code: 502,
      message: 'Bad Gateway',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('login-button'));

    const failMessage = await waitFor(() => getByTestId('fail-message'));

    expect(failMessage).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('Correct login', () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = { replace: jest.fn() };
  });

  afterAll(() => {
    window.location = location;
  });

  it('mocks `replace`', () => {
    expect(jest.isMockFunction(window.location.replace)).toBe(true);
  });

  it('logs user in correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onPost('/auth/login').reply(200, {
      user: {
        id: 'testId',
        role: 'user',
      },
      tokens: {
        access: {
          token: 'testAccess',
        },
        refresh: {
          token: 'testRefresh',
        },
      },
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('login-button'));

    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith('/User/Overview'));
  });

  it('logs admin in correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onPost('/auth/login').reply(200, {
      user: {
        id: 'testId',
        role: 'admin',
      },
      tokens: {
        access: {
          token: 'testAccess',
        },
        refresh: {
          token: 'testRefresh',
        },
      },
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('login-button'));

    await waitFor(() => expect(window.location.replace).toHaveBeenCalledWith('/Admin/Tools'));
  });
});

describe('dropup functionality', () => {
  it('shows info when hover', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.hover(getByTestId('dropup'));

    expect(getByTestId('info')).toBeTruthy();
  });
});

describe('visibility password', () => {
  it('password has type password', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(getByTestId('password').type).toEqual('password');
  });

  it('password becomes visible on click', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('visibility'));
    expect(getByTestId('password').type).toEqual('text');
  });

  it('password is invisible on two clicks', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    userEvent.click(getByTestId('visibility'));
    userEvent.click(getByTestId('visibility'));
    expect(getByTestId('password').type).toEqual('password');
  });
});
