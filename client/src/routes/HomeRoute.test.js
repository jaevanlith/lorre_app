import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Route, BrowserRouter } from 'react-router-dom';
import HomeRoute from './HomeRoute';
import Tools from '../Admin/Tools';
import history from '../history';
import Overview from '../User/Overview';
import Login from '../Home/Login';

afterEach(cleanup);

jest.mock('../Admin/Tools', () => () => <div data-testid="tools-screen" />);
jest.mock('../User/Overview', () => () => <div data-testid="overview-screen" />);
jest.mock('../Home/Login', () => () => <div data-testid="login-screen" />);

it('displays home page when not logged in', () => {
  history.push('/Login');

  const { getByTestId } = render(
    <BrowserRouter>
      <HomeRoute path="/Login" component={Login} />
    </BrowserRouter>
  );

  expect(getByTestId('login-screen')).toBeVisible();
});

it('redirects to admin view when logged in as admin', () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('accessToken', '1');
  localStorage.setItem('role', 'admin');

  history.push('/Login');

  const { getByTestId } = render(
    <BrowserRouter>
      <HomeRoute path="/Login" component={Login} />
      <Route path="/Admin/Tools" component={Tools} />
    </BrowserRouter>
  );

  expect(getByTestId('tools-screen')).toBeVisible();
});

it('redirects to user view when logged in as user', () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('accessToken', '1');
  localStorage.setItem('role', 'user');

  history.push('/Login');

  const { getByTestId } = render(
    <BrowserRouter>
      <HomeRoute path="/Login" component={Login} />
      <Route path="/User/Overview" component={Overview} />
    </BrowserRouter>
  );

  expect(getByTestId('overview-screen')).toBeVisible();
});
