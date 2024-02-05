import React from 'react';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserPreview from './UserPreview';
import { BrowserRouter } from 'react-router-dom';

afterEach(cleanup);

it('displays user preview correctly', async () => {
  const { getByTestId } = render(
    <BrowserRouter>
      <UserPreview userId="1234" firstName="Henk" lastName="de Bruin" email="email@email.com" />
    </BrowserRouter>
  );

  expect(getByTestId('1234')).toBeVisible();
  expect(getByTestId('name')).toHaveTextContent('Henk de Bruin');
  expect(getByTestId('email')).toHaveTextContent('email@email.com');

  userEvent.click(getByTestId('name'));
  expect(window.location.href.substring(window.location.href.lastIndexOf('/') + 1)).toEqual('1234');
});
