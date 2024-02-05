import React from 'react';
import { shallow } from 'enzyme';
import AgeChart from './AgeChart';

const data = [
  {
    userId: {
      dateOfBirth: '1998-08-03T00:00:00.000+00:00',
    },
  },
  {
    userId: {
      dateOfBirth: '1998-10-23T00:00:00.000+00:00',
    },
  },
  {
    userId: {
      dateOfBirth: '2002-01-03T00:00:00.000+00:00',
    },
  },
  {
    userId: {
      dateOfBirth: '',
    },
  },
];

it('has no labels and data when no results', () => {
  const wrapper = shallow(<AgeChart results={[]} />);
  expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
  expect(wrapper.instance().state.data.labels).toEqual([]);
});

it('sets labels correctly', () => {
  const wrapper = shallow(<AgeChart results={[]} />);
  wrapper.setProps({ results: data });
  expect(wrapper.instance().state.data.labels).toEqual([19, 20, 21, 22]);
});

it('sets amounts correctly', () => {
  const wrapper = shallow(<AgeChart results={[]} />);
  wrapper.setProps({ results: data });
  expect(wrapper.instance().state.data.datasets[0].data).toEqual([1, 0, 0, 2]);
});
