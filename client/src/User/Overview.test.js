import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import Overview from './Overview';
import api from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';

// Mock Live Count component as it is not part of this unit test
jest.mock('./../Components/LiveCount', () => () => <div />);

beforeEach(() => localStorage.setItem('userId', '1234'));
afterEach(cleanup);

describe('Display passes', () => {
  it('retrieves and displays 1 pass correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Boyd',
      lastName: 'Hoek',
      id: '1234',
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
        <Overview />
      </BrowserRouter>
    );

    const pass = await waitFor(() => getByTestId('5fe3'));
    expect(pass).toBeVisible();
  });

  it('retrieves and displays multiple passes correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Boyd',
      lastName: 'Hoek',
      id: '1234',
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
      {
        userId: '1234',
        type: 'one-time',
        startDate: '2020-02-16T22:57:42.572Z',
        endDate: '2021-02-16T22:57:42.572Z',
        img: 'source',
        id: '3968',
      },
    ]);

    const { getByTestId } = render(
      <BrowserRouter>
        <Overview />
      </BrowserRouter>
    );

    const passOne = await waitFor(() => getByTestId('5fe3'));
    const passTwo = await waitFor(() => getByTestId('3968'));
    expect(passOne).toBeVisible();
    expect(passTwo).toBeVisible();
  });

  it('displays message when no passes', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Boyd',
      lastName: 'Hoek',
      id: '1234',
    });
    mock.onGet('/tickets/get/1234').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Overview />
      </BrowserRouter>
    );

    const noPassMessage = await waitFor(() => getByTestId('no-passes'));
    expect(noPassMessage).toBeVisible();
  });
});

describe('Handle errors', () => {
  it('displays message on failed user retrieval', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(400);
    mock.onGet('/tickets/get/1234').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Overview />
      </BrowserRouter>
    );

    const errMessage = await waitFor(() => getByTestId('err-message'));
    expect(errMessage).toBeVisible();
  });

  it('displays message on failed ticket retrieval', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/1234').reply(200);
    mock.onGet('/tickets/get/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <Overview />
      </BrowserRouter>
    );

    const errMessage = await waitFor(() => getByTestId('err-message'));
    expect(errMessage).toBeVisible();
  });
});
