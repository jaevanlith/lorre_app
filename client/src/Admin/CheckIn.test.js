import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckIn from './CheckIn';
import { shallow } from 'enzyme';
import api from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';

// Mock Live Count Manipulator and QR reader as they are not part of this unit test
jest.mock('./Components/LiveCountManipulator', () => () => <div />);
jest.mock('react-qr-reader', () => () => <div />);

afterEach(cleanup);

// Tests for open and close functionality
describe('Open and close display', () => {
  // Test if initially the closed container is displayed
  it('is closed', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    expect(await waitFor(() => getByTestId('closed-container'))).toBeTruthy();
    expect(await waitFor(() => queryByTestId('open-container'))).toBeFalsy();
  });

  // Test if the open container is displayed on clicking open
  it('opens on open click', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
    mock.onPost('/users/changeStatus').reply(200, 'open');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    expect(await waitFor(() => getByTestId('closed-container'))).toBeTruthy();
    expect(await waitFor(() => queryByTestId('open-container'))).toBeFalsy();

    const openBtn = await waitFor(() => getByTestId('open-btn'));
    userEvent.click(openBtn);

    expect(await waitFor(() => getByTestId('open-container'))).toBeTruthy();
    expect(await waitFor(() => queryByTestId('closed-container'))).toBeFalsy();
  });

  // Test if the closed container is displayed on clicking close
  it('closes on close click and close confirm', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'open');
    mock.onPost('/users/changeStatus').reply(200, 'closed');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('close-btn')));
    const closeWarning = await waitFor(() => getByTestId('close-warning'));
    const closeCancel = await waitFor(() => getByTestId('close-cancel'));
    const closeConfirm = await waitFor(() => getByTestId('close-confirm'));

    expect(closeWarning).toBeVisible();
    expect(closeCancel).toBeVisible();
    expect(closeConfirm).toBeVisible();

    userEvent.click(closeConfirm);
    const closed = await waitFor(() => getByTestId('closed-container'));
    const openContainer = await waitFor(() => queryByTestId('open-container'));

    expect(closed).toBeTruthy();
    expect(openContainer).toBeFalsy();
  });

  // Test if the closed container is displayed on clicking close
  it('stays open after close cancel', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'open');
    mock.onPost('/users/changeStatus').reply(200, 'closed');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('close-btn')));
    const closeWarning = await waitFor(() => getByTestId('close-warning'));
    const closeCancel = await waitFor(() => getByTestId('close-cancel'));
    const closeConfirm = await waitFor(() => getByTestId('close-confirm'));

    expect(closeWarning).toBeVisible();
    expect(closeCancel).toBeVisible();
    expect(closeConfirm).toBeVisible();

    userEvent.click(closeCancel);
    const closedContainer = await waitFor(() => queryByTestId('closed-container'));
    const openContainer = await waitFor(() => queryByTestId('open-container'));

    expect(openContainer).toBeTruthy();
    expect(closedContainer).toBeFalsy();
  });

  it('desplays error on not getting current status', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('users/lorre/getStatus').reply(400);
    const { getByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );
    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });

  it('displays error on not opening', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
    mock.onPost('users/changeStatus').reply(400);
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('open-btn')));

    const screen = await waitFor(() => queryByTestId('screen'));

    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });
});

// Test for display of QR reader and result
describe('QR reader and result display', () => {
  // Test if QR reader is hidden and result is shown initially
  it('shows result initially', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('users/lorre/getStatus').reply(200, 'closed');
    mock.onPost('users/changeStatus').reply(200, 'open');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('open-btn')));
    await waitFor(() => queryByTestId('open-container'));

    expect(queryByTestId('qr-result')).toBeTruthy();
    expect(queryByTestId('qr-reader')).toBeFalsy();
  });

  // Test if QR reader is displayed on clicking start scan
  it('shows reader on start click', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
    mock.onPost('users/changeStatus').reply(200, 'open');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('open-btn')));
    await waitFor(() => queryByTestId('open-container'));

    userEvent.click(queryByTestId('start-scan-button'));
    await waitFor(() => queryByTestId('open-container'));

    expect(queryByTestId('qr-result')).toBeFalsy();
    expect(queryByTestId('qr-reader')).toBeTruthy();
  });

  // Test if result is displayed on clicking stop scan
  it('shows result on stop click', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'closed');
    mock.onPost('users/changeStatus').reply(200, 'open');
    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <CheckIn />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('open-btn')));
    await waitFor(() => queryByTestId('open-container'));

    userEvent.click(queryByTestId('start-scan-button'));
    await waitFor(() => queryByTestId('open-container'));

    userEvent.click(queryByTestId('stop-scan-button'));
    await waitFor(() => queryByTestId('open-container'));

    expect(queryByTestId('qr-result')).toBeTruthy();
    expect(queryByTestId('qr-reader')).toBeFalsy();
  });
});

describe('API call', () => {
  it('shows message on successful call', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/lorre/getStatus').reply(200, 'open');
    mock.onGet('/tickets/verify/1234').reply(200, 'Inchecken gelukt');

    const wrapper = shallow(<CheckIn />);
    await waitFor(() => wrapper.instance().handleScan('1234'));
    await tick();
    expect(wrapper.instance().state.success).toEqual('Inchecken gelukt');
  });

  it('shows message on failed call', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/tickets/verify/1234').reply(400);

    const wrapper = shallow(<CheckIn />);
    wrapper.instance().handleScan('1234');
    await tick();
    expect(wrapper.instance().state.fail).toEqual('Inchecken mislukt');
  });

  function tick() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
});
