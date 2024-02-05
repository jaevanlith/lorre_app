import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import LiveCountManipulator from './LiveCountManipulator';
import userEvent from '@testing-library/user-event';
import api from '../../utils/API';
import MockAdapter from 'axios-mock-adapter';

afterEach(cleanup);
describe('Live count display', () => {
  it('displays live count correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '200');

    const { getByTestId } = render(<LiveCountManipulator />);

    const numVisitors = await waitFor(() => getByTestId('num-visitors'));

    expect(numVisitors).toHaveTextContent('200');
  });

  it('displays error message', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(400);

    const { getByTestId } = render(<LiveCountManipulator />);

    const errRetrieve = await waitFor(() => getByTestId('err-retrieve'));

    expect(errRetrieve).toBeTruthy();
  });
});

describe('Increment live count', () => {
  it('increments correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '200');
    mock.onGet('/users/currentCheckIns/plus').reply(200, '201');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('incr-button'));
    const errMessage = await waitFor(() => getByTestId('err-message'));

    expect(numVisitors).toHaveTextContent('201');
    expect(errMessage).not.toHaveTextContent();
  });

  it('fails to increment', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '200');
    mock.onGet('/users/currentCheckIns/plus').reply(400, 'fail');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('incr-button'));
    const errMessage = await waitFor(() => getByTestId('err-message'));

    expect(numVisitors).toHaveTextContent('200');
    expect(errMessage).toHaveTextContent('Verhogen mislukt');
  });

  it('blocks incrementation at max capacity', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '500');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('incr-button'));
    const errMessage = getByTestId('err-message');

    expect(numVisitors).toHaveTextContent('500');
    expect(errMessage).toHaveTextContent('Maximum bereikt');
  });
});

describe('Decrement live count', () => {
  it('decrements correctly', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '200');
    mock.onGet('/users/currentCheckIns/minus').reply(200, '199');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('decr-button'));
    const errMessage = await waitFor(() => getByTestId('err-message'));

    expect(numVisitors).toHaveTextContent('199');
    expect(errMessage).not.toHaveTextContent();
  });

  it('fails to decrement', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '200');
    mock.onGet('/users/currentCheckIns/minus').reply(400, 'fail');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('decr-button'));
    const errMessage = await waitFor(() => getByTestId('err-message'));

    expect(numVisitors).toHaveTextContent('200');
    expect(errMessage).toHaveTextContent('Verlagen mislukt');
  });

  it('blocks decrementation at min capacity', async () => {
    const mock = new MockAdapter(api);
    mock.onGet('/users/currentCheckIns/total').reply(200, '0');

    const { getByTestId } = render(<LiveCountManipulator />);
    const numVisitors = await waitFor(() => getByTestId('num-visitors'));
    userEvent.click(getByTestId('decr-button'));
    const errMessage = getByTestId('err-message');

    expect(numVisitors).toHaveTextContent('0');
    expect(errMessage).toHaveTextContent('Minimum bereikt');
  });
});
