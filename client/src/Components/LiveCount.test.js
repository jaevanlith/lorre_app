import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import LiveCount from './LiveCount';
import api from '../utils/API';
import MockAdapter from 'axios-mock-adapter';

afterEach(cleanup);

// Test if the amount of visitors is displayed correctly
it('displays live count correctly', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/lorre/getStatus').reply(200, 'open');
  mock.onGet('/users/currentCheckIns/total').reply(200, '200');

  const { getByTestId } = render(<LiveCount />);

  const numVisitors = await waitFor(() => getByTestId('num-visitors'));

  expect(numVisitors).toHaveTextContent('200');
});

it('does not display live count', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
  mock.onGet('/users/currentCheckIns/total').reply(200, '200');

  const { getByTestId } = render(<LiveCount />);

  const logo = await waitFor(() => getByTestId('logo'));

  expect(logo).toBeVisible();
});

// Test if error message is displayed when get unsuccessful
it('displays error message', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
  mock.onGet('/users/currentCheckIns/total').reply(400);

  const { getByTestId } = render(<LiveCount />);

  const errMessage = await waitFor(() => getByTestId('err-message'));

  expect(errMessage).toBeTruthy();
});

it('displays error message getStatus', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/lorre/getStatus').reply(400);
  mock.onGet('/users/currentCheckIns/total').reply(200, '200');

  const { getByTestId } = render(<LiveCount />);

  const errMessage = await waitFor(() => getByTestId('err-message'));

  expect(errMessage).toBeTruthy();
});
