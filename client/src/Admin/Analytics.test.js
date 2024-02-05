import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Analytics from './Analytics';
import { BrowserRouter } from 'react-router-dom';
import api from './../utils/API';
import MockAdapter from 'axios-mock-adapter';

afterEach(cleanup);

describe('Select time interval', () => {
  it('shows date fields on click', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('interval'));
    expect(getByTestId('date-fields')).toBeVisible();
  });

  it('hide date fields on click', () => {
    const { queryByTestId, getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('interval'));
    userEvent.click(getByTestId('all-time'));
    expect(queryByTestId('date-fields')).toBeFalsy();
  });
});

describe('Display analytics', () => {
  it('displays gender chart', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/analytics/queryAllTime?gender=1&dateOfBirth=0&university=0&city=0').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('gender'));
    userEvent.click(getByTestId('all-time'));
    userEvent.click(getByTestId('submit'));

    const genderChart = await waitFor(() => getByTestId('gender-chart'));
    expect(genderChart).toBeVisible();
  });

  it('displays age chart', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/analytics/queryAllTime?gender=0&dateOfBirth=1&university=0&city=0').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('age'));
    userEvent.click(getByTestId('all-time'));
    userEvent.click(getByTestId('submit'));

    const ageChart = await waitFor(() => getByTestId('age-chart'));
    expect(ageChart).toBeVisible();
  });

  it('displays university chart', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/analytics/queryAllTime?gender=0&dateOfBirth=0&university=1&city=0').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('university'));
    userEvent.click(getByTestId('all-time'));
    userEvent.click(getByTestId('submit'));

    const universityChart = await waitFor(() => getByTestId('university-chart'));
    expect(universityChart).toBeVisible();
  });

  it('displays city chart', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/analytics/queryAllTime?gender=0&dateOfBirth=0&university=0&city=1').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('city'));
    userEvent.click(getByTestId('all-time'));
    userEvent.click(getByTestId('submit'));

    const cityChart = await waitFor(() => getByTestId('city-chart'));
    expect(cityChart).toBeVisible();
  });

  it('displays time chart', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/analytics/queryAllTime?gender=0&dateOfBirth=0&university=0&city=0').reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('time'));
    userEvent.click(getByTestId('all-time'));
    userEvent.click(getByTestId('submit'));

    const cityChart = await waitFor(() => getByTestId('time-chart'));
    expect(cityChart).toBeVisible();
  });

  it('displays chart on interval', async () => {
    const mock = new MockAdapter(api);
    mock
      .onGet(
        '/analytics/queryTimeInterval?startDate=2020-01-01&endDate=2021-01-01&gender=0&dateOfBirth=0&university=0&city=1'
      )
      .reply(200, []);

    const { getByTestId } = render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    userEvent.click(getByTestId('city'));
    userEvent.click(getByTestId('interval'));
    userEvent.type(getByTestId('start-date'), '2020-01-01');
    userEvent.type(getByTestId('end-date'), '2021-01-01');
    userEvent.click(getByTestId('submit'));

    const cityChart = await waitFor(() => getByTestId('city-chart'));
    expect(cityChart).toBeVisible();
  });
});
