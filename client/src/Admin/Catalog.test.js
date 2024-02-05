import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalog from './Catalog';
import api from './../utils/API';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';

afterEach(cleanup);

it('fetches and displays search result on type', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/search/inclusive?keyword=a').reply(200, [
    {
      id: '1234',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
    },
  ]);

  const { getByTestId } = render(
    <BrowserRouter>
      <Catalog />
    </BrowserRouter>
  );

  userEvent.type(getByTestId('search-bar'), 'a');
  const userPreview = await waitFor(() => getByTestId('1234'));
  expect(userPreview).toBeVisible();
});

it('updates search result on type', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/search/inclusive?keyword=a').reply(200, [
    {
      id: '1234',
      firstName: 'Henk',
      lastName: 'de Bruin',
      email: 'email@email.com',
    },
  ]);
  mock.onGet('/users/search/inclusive?keyword=ab').reply(200, [
    {
      id: '12345',
      firstName: 'Frank',
      lastName: 'de Boer',
      email: 'info@gmail.com',
    },
  ]);

  const { getByTestId } = render(
    <BrowserRouter>
      <Catalog />
    </BrowserRouter>
  );

  userEvent.type(getByTestId('search-bar'), 'a');
  const userPreview = await waitFor(() => getByTestId('1234'));
  expect(userPreview).toBeVisible();

  userEvent.type(getByTestId('search-bar'), 'b');
  const userPreviewUpdate = await waitFor(() => getByTestId('12345'));
  expect(userPreviewUpdate).toBeVisible();
});

it('displays message when no search result on type', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/search/inclusive?keyword=a').reply(200, {
    results: [],
  });

  const { getByTestId } = render(
    <BrowserRouter>
      <Catalog />
    </BrowserRouter>
  );

  userEvent.type(getByTestId('search-bar'), 'a');
  const userPreview = await waitFor(() => getByTestId('no-results'));
  expect(userPreview).toHaveTextContent("Geen resultaten voor 'a'");
});

it('displays loading message while waiting for response', () => {
  const { getByTestId } = render(
    <BrowserRouter>
      <Catalog />
    </BrowserRouter>
  );

  userEvent.type(getByTestId('search-bar'), 'a');
  expect(getByTestId('loading')).toHaveTextContent('Laden...');
});

it('displays message on error', async () => {
  const mock = new MockAdapter(api);
  mock.onGet('/users/search/inclusive?keyword=a').reply(400);

  const { getByTestId } = render(
    <BrowserRouter>
      <Catalog />
    </BrowserRouter>
  );

  userEvent.type(getByTestId('search-bar'), 'a');
  const userPreview = await waitFor(() => getByTestId('err-message'));
  expect(userPreview).toHaveTextContent('Zoeken mislukt');
});
