import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import API from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import BuyPassForm from './BuyPass';
import { format, addYears } from 'date-fns';
import userEvent from '@testing-library/user-event';

let container;

// Mock LiveCount component as it is not relevant to this unit test
jest.mock('../Components/LiveCount', () => () => <div />);

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
  cleanup();
});

describe('Rendering and user request', () => {
  it('displays correctly, user request succes', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <BuyPassForm />
      </BrowserRouter>
    );

    const start = format(Date.now(), 'yyyy-MM-dd');
    const end = format(addYears(Date.now(), 1), 'yyyy-MM-dd');
    const title = await waitFor(() => getByTestId('title'));
    const name = await waitFor(() => getByTestId('name'));
    const screen = await waitFor(() => getByTestId('screen'));
    const day = await waitFor(() => getByTestId('day'));

    expect(screen).not.toHaveTextContent('Er is iets misgegaan');
    expect(title).toHaveTextContent('Pas kopen');
    expect(name).toHaveTextContent('Op naam van: Harry Styles');
    expect(screen).toHaveTextContent('Startdatum: ', start);
    expect(screen).toHaveTextContent('Kaart zal komen te vervallen op: ', end);
    expect(screen).not.toHaveTextContent('wijzigen');

    expect(screen).toHaveTextContent('Kosten: €8,50');

    userEvent.click(day);

    expect(screen).toHaveTextContent('Kosten: €2,00');
  });

  it('user request fails', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(400, {
      errMessage: 'Er is iets misgegaan',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <BuyPassForm />
      </BrowserRouter>
    );

    const screen = await waitFor(() => getByTestId('screen'));

    expect(screen).toHaveTextContent('Er is iets misgegaan');
  });

  it('displays correctly after buttons are clicked', async () => {
    localStorage.setItem('userId', '1234');

    const mock = new MockAdapter(API);
    mock.onGet('/users/1234').reply(200, {
      firstName: 'Harry',
      lastName: 'Styles',
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <BuyPassForm />
      </BrowserRouter>
    );

    const start = format(Date.now(), 'yyyy-MM-dd');
    const end = format(addYears(Date.now(), 1), 'yyyy-MM-dd');
    const check = await waitFor(() => getByTestId('check'));
    const day = await waitFor(() => getByTestId('day'));

    userEvent.click(day);
    userEvent.click(check);
    const checkScreen = await waitFor(() => getByTestId('screen'));
    const change = await waitFor(() => getByTestId('change'));

    expect(checkScreen).not.toHaveTextContent('Er is iets misgegaan');
    expect(checkScreen).toHaveTextContent('Controleer bestelling');
    expect(checkScreen).toHaveTextContent('Op naam van: Harry Styles');
    expect(checkScreen).toHaveTextContent('Pas zal ingaan op: ', start);
    expect(checkScreen).toHaveTextContent('Pas zal komen te vervallen op: ', end);
    expect(checkScreen).toHaveTextContent('Type pas: Eenmalig');
    expect(checkScreen).toHaveTextContent('Kosten: €2,00');

    userEvent.click(change);
    const changeScreen = await waitFor(() => getByTestId('screen'));
    expect(changeScreen).toHaveTextContent('Pas kopen');
    expect(changeScreen).toHaveTextContent('Op naam van: Harry Styles');

    const check2 = await waitFor(() => getByTestId('check'));
    const year = await waitFor(() => getByTestId('year'));
    userEvent.click(year);
    userEvent.click(check2);
    const checkScreen2 = await waitFor(() => getByTestId('screen'));
    expect(checkScreen2).toHaveTextContent('Type pas: Jaarpas');
    expect(checkScreen2).toHaveTextContent('Kosten: €8,50');
  });
});
