import PaymentCancelled from './PaymentCancelled';

import React from 'react';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Diplay screen', () => {
  it('show cancelled screen correctly', () => {
    const { getByTestId } = render(<PaymentCancelled />);

    const screen = getByTestId('screen');

    expect(screen).toHaveTextContent('Je hebt de betaling geannulleerd.');
    expect(screen).toHaveTextContent('Probeer het opnieuw!');
    expect(getByTestId('again')).toBeTruthy();
    expect(screen).toHaveTextContent('Niet nog een keer proberen? Terug naar je overzicht');
    expect(getByTestId('viewPassFail')).toBeTruthy();
  });
});
