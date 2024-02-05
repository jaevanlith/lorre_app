import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Route, BrowserRouter } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import Tools from '../Admin/Tools';
import history from '../history';
import Overview from '../User/Overview';
import Login from '../Home/Login';

afterEach(cleanup);

jest.mock('../Admin/Tools', () => () => <div data-testid="tools-screen" />);
jest.mock('../User/Overview', () => () => <div data-testid="overview-screen" />);
jest.mock('../Home/Login', () => () => <div data-testid="login-screen" />);

it('redirects to home page when not logged in', () => {
  history.push('/Admin/Tools');

  const { getByTestId } = render(
    <BrowserRouter>
      <AdminRoute path="/Admin/Tools" component={Tools} />
      <Route path="/Login" component={Login} />
    </BrowserRouter>
  );

  expect(getByTestId('login-screen')).toBeVisible();
});

it('displays admin view when authorized', () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('accessToken', '1');
  localStorage.setItem('role', 'admin');

  history.push('/Admin/Tools');

  const { getByTestId } = render(
    <BrowserRouter>
      <AdminRoute path="/Admin/Tools" component={Tools} />
    </BrowserRouter>
  );

  expect(getByTestId('tools-screen')).toBeVisible();
});

it('redirects to user view when logged in as user', () => {
  localStorage.setItem('userId', '1');
  localStorage.setItem('accessToken', '1');
  localStorage.setItem('role', 'user');

  history.push('/Admin/Tools');

  const { getByTestId } = render(
    <BrowserRouter>
      <AdminRoute path="/Admin/Tools" component={Tools} />
      <Route path="/User/Overview" component={Overview} />
    </BrowserRouter>
  );

  expect(getByTestId('overview-screen')).toBeVisible();
});
