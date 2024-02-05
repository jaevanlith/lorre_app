import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pass from './Pass';
import MockAdapter from "axios-mock-adapter";
import api from "../../utils/API";

jest.mock('./../../Components/Cropper', () => () => <div data-testid="mod-image"/>);

afterEach(cleanup);

describe('Display pass', () => {
  it('displays year pass correctly', async () => {
    const {getByTestId} = render(
      <Pass
        passId={'1234'}
        type={'year'}
        startDate={'2020-12-16T21:11:08.604Z'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'source'}
      />
    );

    expect(getByTestId('type')).toHaveTextContent('Jaarpas');
    expect(getByTestId('pass-id')).toHaveTextContent('1234');
    expect(getByTestId('start-date')).toHaveTextContent('16-12-2020');
    expect(getByTestId('end-date')).toHaveTextContent('16-12-2021');
    expect(getByTestId('cost')).toHaveTextContent('€8,50');
    expect(getByTestId('image')).toHaveAttribute('src', 'source');
    expect(getByTestId("modify-button")).toBeVisible();
  })

  it('displays one-time pass correctly', async () => {
    const {getByTestId} = render(
      <Pass
        passId={'1234'}
        type={'one-time'}
        startDate={'2020-12-16T21:11:08.604Z'}
        endDate={'2021-12-16T21:11:08.604Z'}
        image={'source'}
      />
    );

    expect(getByTestId('type')).toHaveTextContent('Dagpas');
    expect(getByTestId('pass-id')).toHaveTextContent('1234');
    expect(getByTestId('start-date')).toHaveTextContent('16-12-2020');
    expect(getByTestId('end-date')).toHaveTextContent('16-12-2021');
    expect(getByTestId('cost')).toHaveTextContent('€2,00');
    expect(getByTestId('image')).toHaveAttribute('src', 'source');
    expect(getByTestId("modify-button")).toBeVisible();
  })
})

describe('Modify pass', () => {
  describe('Modify mode', () => {
    it('switches to modify mode correctly', () => {
      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));

      expect(getByTestId('mod-start-date').value).toEqual('2020-12-16');
      expect(getByTestId('mod-end-date').value).toEqual('2021-12-16');
      expect(getByTestId('mod-image')).toBeVisible();
    })

    it('blocks update when start date later than end date', () => {
      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.type(getByTestId('mod-start-date'), '2021-12-29');

      expect(getByTestId('mod-start-date').value).toEqual('2020-12-16');
    })

    it('blocks update when end date earlier than start date', () => {
      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.type(getByTestId('mod-end-date'), '2020-05-29');

      expect(getByTestId('mod-end-date').value).toEqual('2021-12-16');
    })
  })

  describe('Save modification', () => {
    it('saves modification correctly', async () => {
      const mock = new MockAdapter(api);
      mock.onPatch('/tickets/1234').reply(200, {
        type: 'year',
        startDate: '2020-12-16T21:11:08.604Z',
        endDate: '2021-12-16T21:11:08.604Z',
        img: 'newSource'
      })

      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.type(getByTestId('mod-image'), 'newSource');
      userEvent.click(getByTestId('save-button'));

      const image = await waitFor(() => getByTestId('image'));
      expect(image).toHaveAttribute('src', 'newSource');
    })

    it('displays message on error', async () => {
      const mock = new MockAdapter(api);
      mock.onPatch('/tickets/1234').reply(400);

      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.type(getByTestId('mod-image'), 'newSource');
      userEvent.click(getByTestId('save-button'));

      const saveFail = await waitFor(() => getByTestId('save-fail'));
      expect(saveFail).toHaveTextContent('Pas wijzigen mislukt');
    })
  })

  describe('Cancel modification', () => {
    it('cancels correctly when no changes', () => {
      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.click(getByTestId('cancel-button'));

      expect(getByTestId('type')).toHaveTextContent('Jaarpas');
      expect(getByTestId('pass-id')).toHaveTextContent('1234');
      expect(getByTestId('start-date')).toHaveTextContent('16-12-2020');
      expect(getByTestId('end-date')).toHaveTextContent('16-12-2021');
      expect(getByTestId('cost')).toHaveTextContent('€8,50');
      expect(getByTestId('image')).toHaveAttribute('src', 'source');
      expect(getByTestId("modify-button")).toBeVisible();
    })

    it('discards changes on cancel', () => {
      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'year'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.type(getByTestId('mod-start-date'), '2020-10-25');
      userEvent.click(getByTestId('cancel-button'));

      expect(getByTestId('type')).toHaveTextContent('Jaarpas');
    })
  })

  describe('Delete pass', () => {
    it('deletes pass correctly', async () => {
      const mock = new MockAdapter(api);
      mock.onDelete('/tickets/1234').reply(200);

      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'one-time'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.click(getByTestId('delete-button'));

      const deleted = await waitFor(() => getByTestId('deleted'));
      expect(deleted).toHaveTextContent('Pas succesvol verwijderd');
    })

    it('displays message when pass deletion failed', async () => {
      const mock = new MockAdapter(api);
      mock.onDelete('/tickets/1234').reply(400);

      const {getByTestId} = render(
        <Pass
          passId={'1234'}
          type={'one-time'}
          startDate={'2020-12-16T21:11:08.604Z'}
          endDate={'2021-12-16T21:11:08.604Z'}
          image={'source'}
        />
      );

      userEvent.click(getByTestId('modify-button'));
      userEvent.click(getByTestId('delete-button'));

      const deleteFail = await waitFor(() => getByTestId('delete-fail'));
      expect(deleteFail).toHaveTextContent('Pas verwijderen mislukt');
    })
  })
})
