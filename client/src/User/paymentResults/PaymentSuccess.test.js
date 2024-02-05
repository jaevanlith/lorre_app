import PaymentSuccess from './PaymentSuccess';

import React from 'react';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Diplay screen', () => {
  it('show success screen correctly', () => {
    const { getByTestId } = render(<PaymentSuccess />);

    const screen = getByTestId('screen');

    expect(screen).toHaveTextContent('Bedankt, je betaling is gelukt!');
    expect(screen).toHaveTextContent('U kunt hier uw nieuwe pas bekijken:');
    expect(getByTestId('viewPassSuccess')).toBeTruthy();
  });
});
