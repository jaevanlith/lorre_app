import PaymentFailed from './PaymentFailed';

import React from 'react';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Diplay screen', () => {
  it('show fail screen correctly', () => {
    const { getByTestId } = render(<PaymentFailed />);

    const screen = getByTestId('screen');

    expect(screen).toHaveTextContent('Oeps, de betaling is afgewezen.');
    expect(screen).toHaveTextContent('Probeer het opnieuw!');
    expect(getByTestId('again')).toBeTruthy();
    expect(screen).toHaveTextContent('Niet nog een keer proberen? Terug naar je overzicht');
    expect(getByTestId('viewPassFail')).toBeTruthy();
  });
});
