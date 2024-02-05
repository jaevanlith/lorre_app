import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import CheckInHistory from './CheckInHistory';
import userEvent from '@testing-library/user-event';

// Mock LiveCount component as it is not relevant to this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

afterEach(cleanup);

describe('Renders correctly', () => {
  it('displays history correct', async () => {
    localStorage.setItem('userId', '1234');
    const data = [
      { date: '2020-12-18T17:56:19.091Z', id: '12' },
      { date: '2020-12-19T01:32:19.091Z', id: '13' },
      { date: '2021-01-08T23:42:19.091Z', id: '14' },
    ];
    const mock = new MockAdapter(API);
    mock.onGet('/checkIns/history/1234').reply(200, data);

    const { getByTestId } = render(
      <BrowserRouter>
        <CheckInHistory />
      </BrowserRouter>
    );

    const table = await waitFor(() => getByTestId('table'));
    expect(table).toBeTruthy();
    expect(table).toHaveTextContent('Je bent 3 keer ingecheckt.');
    expect(table).toHaveTextContent('Dit zijn de dagen waarop je bent langsgekomen:');
    expect(table).toHaveTextContent('2020-12-18 om 17:56');
    expect(table).toHaveTextContent('2020-12-19 om 01:32');
    expect(table).toHaveTextContent('2021-01-08 om 23:42');

    expect(await waitFor(() => getByTestId('deleteHistory'))).not.toBeChecked();
    expect((await waitFor(() => getByTestId('delete'))).disabled).toBeTruthy();

    userEvent.click(await waitFor(() => getByTestId('deleteHistory')));
    expect(await waitFor(() => getByTestId('deleteHistory'))).toBeChecked();
    expect(await waitFor(() => getByTestId('delete'))).not.toBeDisabled();
  });
  it('displays empty history correctly', async () => {
    localStorage.setItem('userId', '1234');
    const data = [];
    const mock = new MockAdapter(API);
    mock.onGet('/checkIns/history/1234').reply(200, data);

    const { getByTestId } = render(
      <BrowserRouter>
        <CheckInHistory />
      </BrowserRouter>
    );

    expect(await waitFor(() => getByTestId('screen'))).toHaveTextContent(
      'Je bent nog nooit ingecheckt. Kom een keer langs!'
    );
  });

  it('displays error correctly', async () => {
    localStorage.setItem('userId', '1234');
    const mock = new MockAdapter(API);
    mock.onGet('/checkIns/history/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <CheckInHistory />
      </BrowserRouter>
    );

    const screen = await waitFor(() => getByTestId('screen'));
    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });
});

describe('Correct delete', () => {
  it('deletes history correctly', async () => {
    localStorage.setItem('userId', '1234');
    const data = [
      { date: '2020-12-18T17:56:19.091Z', id: '12' },
      { date: '2020-12-19T17:56:19.091Z', id: '13' },
      { date: '2021-01-08T17:56:19.091Z', id: '14' },
    ];
    const mock = new MockAdapter(API);
    mock.onGet('/checkIns/history/1234').reply(200, data);
    mock.onGet('/checkIns/clearHistory/1234').reply(200);

    const { getByTestId } = render(
      <BrowserRouter>
        <CheckInHistory />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('deleteHistory')));
    userEvent.click(await waitFor(() => getByTestId('delete')));

    expect(await waitFor(() => getByTestId('screen'))).toHaveTextContent('Geschiedenis is verwijderd.');
    expect(await waitFor(() => getByTestId('screen'))).toHaveTextContent(
      'Je bent nog nooit ingecheckt. Kom een keer langs!'
    );
  });

  it('delete gets error', async () => {
    localStorage.setItem('userId', '1234');
    const data = [
      { date: '2020-12-18T17:56:19.091Z', id: '12' },
      { date: '2020-12-19T17:56:19.091Z', id: '13' },
      { date: '2021-01-08T17:56:19.091Z', id: '14' },
    ];
    const mock = new MockAdapter(API);
    mock.onGet('/checkIns/history/1234').reply(200, data);
    mock.onGet('/checkIns/clearHistory/1234').reply(400);

    const { getByTestId } = render(
      <BrowserRouter>
        <CheckInHistory />
      </BrowserRouter>
    );

    userEvent.click(await waitFor(() => getByTestId('deleteHistory')));
    userEvent.click(await waitFor(() => getByTestId('delete')));

    expect(await waitFor(() => getByTestId('screen'))).toHaveTextContent('Er is iets misgegaan');
  });
});
