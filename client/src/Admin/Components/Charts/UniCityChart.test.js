import React from 'react';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import UniCityChart from './UniCityChart';

const data = [
  {
    userId: {
      city: 'Delft',
      university: 'TU Delft',
    },
  },
  {
    userId: {
      city: 'Delft',
      university: 'Haagse Hogeschool',
    },
  },
  {
    userId: {
      city: 'Amsterdam',
      university: 'UvA',
    },
  },
  {
    userId: {
      city: '',
      university: '',
    },
  },
];

describe('City chart', () => {
  it('sets title correctly', () => {
    const { getByTestId } = render(<UniCityChart results={[]} category="city" />);
    expect(getByTestId('title')).toHaveTextContent('Woonplaats');
  });

  it('has no labels and data when no results', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="city" />);
    expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
    expect(wrapper.instance().state.data.labels).toEqual([]);
  });

  it('sets labels correctly', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="city" />);
    wrapper.setProps({ results: data });
    expect(wrapper.instance().state.data.labels).toEqual(['Delft', 'Amsterdam']);
  });

  it('sets amounts correctly', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="city" />);
    wrapper.setProps({ results: data });
    expect(wrapper.instance().state.data.datasets[0].data).toEqual([2, 1]);
  });
});

describe('University chart', () => {
  it('sets title correctly', () => {
    const { getByTestId } = render(<UniCityChart results={[]} category="university" />);
    expect(getByTestId('title')).toHaveTextContent('Onderwijsinstelling');
  });

  it('has no labels and data when no results', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="university" />);
    expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
    expect(wrapper.instance().state.data.labels).toEqual([]);
  });

  it('sets labels correctly', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="university" />);
    wrapper.setProps({ results: data });
    expect(wrapper.instance().state.data.labels).toEqual(['TU Delft', 'Haagse Hogeschool', 'UvA']);
  });

  it('sets amounts correctly', () => {
    const wrapper = shallow(<UniCityChart results={[]} category="university" />);
    wrapper.setProps({ results: data });
    expect(wrapper.instance().state.data.datasets[0].data).toEqual([1, 1, 1]);
  });
});
