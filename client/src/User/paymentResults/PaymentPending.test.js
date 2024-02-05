import PaymentPending from './PaymentPending';

import React from 'react';
import { render, cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('Diplay screen', () => {
  it('show pending screen correctly', () => {
    const { getByTestId } = render(<PaymentPending />);

    const screen = getByTestId('screen');

    expect(screen).toHaveTextContent('Bedankt, we zijn je betaling aan het verwerken.');
    expect(screen).toHaveTextContent('U kunt alvast hier uw nieuwe pas bekijken:');
    expect(getByTestId('viewPassSuccess')).toBeTruthy();
  });
});
