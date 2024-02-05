import React from 'react';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pass from './Pass';

afterEach(cleanup);

describe('Display pass', () => {
  it('displays year pass correctly', async () => {
    const {getByTestId} = render(
      <Pass
        passId={'1234'}
        firstName={'Frans'}
        lastName={'Bauer'}
        type={'year'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'source'}
      />
    );

    expect(getByTestId('type')).toHaveTextContent('Jaarpas');
    expect(getByTestId('end-date')).toHaveTextContent('16-12-2021');
    expect(getByTestId('cost')).toHaveTextContent('€8,50');
    expect(getByTestId('owner')).toHaveTextContent('Frans Bauer');
    expect(getByTestId('image')).toHaveAttribute('src', 'source');
  })

  it('displays one-time pass correctly', async () => {
    const {getByTestId} = render(
      <Pass
        passId={'1234'}
        firstName={'Frans'}
        lastName={'Bauer'}
        type={'one-time'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'source'}
      />
    );

    expect(getByTestId('type')).toHaveTextContent('Dagpas');
    expect(getByTestId('end-date')).toHaveTextContent('16-12-2021');
    expect(getByTestId('cost')).toHaveTextContent('€2,00');
    expect(getByTestId('owner')).toHaveTextContent('Frans Bauer');
    expect(getByTestId('image')).toHaveAttribute('src', 'source');
  })
})

describe('Expand functions', () => {
  it('expands image and shrinks qr on click', () => {
    const {container, getByTestId} = render(
      <Pass
        passId={'1234'}
        firstName={'Frans'}
        lastName={'Bauer'}
        type={'one-time'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'https://upload.wikimedia.org/wikipedia/commons/3/31/HL365_Profielfoto.jpg'}
      />
    );

    userEvent.click(getByTestId('image'));
    expect(getByTestId('image')).toHaveAttribute('width', '200');
    expect(getByTestId('image')).toHaveAttribute('height', '200');
    expect(container.querySelector('canvas')).toHaveAttribute('width', '50');
    expect(container.querySelector('canvas')).toHaveAttribute('height', '50');
  })

  it('expands qr and shrinks image on click', () => {
    const {container, getByTestId} = render(
      <Pass
        passId={'1234'}
        firstName={'Frans'}
        lastName={'Bauer'}
        type={'one-time'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'https://upload.wikimedia.org/wikipedia/commons/3/31/HL365_Profielfoto.jpg'}
      />
    );

    userEvent.click(container.querySelector('canvas'));
    expect(getByTestId('image')).toHaveAttribute('width', '50');
    expect(getByTestId('image')).toHaveAttribute('height', '50');
    expect(container.querySelector('canvas')).toHaveAttribute('width', '200');
    expect(container.querySelector('canvas')).toHaveAttribute('height', '200');
  })
})

