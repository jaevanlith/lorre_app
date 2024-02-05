import PaymentError from './PaymentError';

import React from 'react';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Diplay screen', () => {
  it('show error screen correctly', () => {
    const { getByTestId } = render(<PaymentError />);

    const screen = getByTestId('screen');

    expect(screen).toHaveTextContent('Oeps, er is iets misgegaan.');
    expect(screen).toHaveTextContent('Probeer het opnieuw!');
    expect(getByTestId('again')).toBeTruthy();
    expect(screen).toHaveTextContent('Niet nog een keer proberen? Terug naar je overzicht');
    expect(getByTestId('viewPassFail')).toBeTruthy();
  });
});
