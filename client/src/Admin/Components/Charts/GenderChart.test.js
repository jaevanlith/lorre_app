import React from 'react';
import { shallow } from 'enzyme';
import GenderChart from './GenderChart';

const data = [
  {
    userId: {
      gender: 'male',
    },
  },
  {
    userId: {
      gender: 'female',
    },
  },
  {
    userId: {
      gender: 'female',
    },
  },
  {
    userId: {
      gender: 'other',
    },
  },
];

it('sets amounts to 0 when no results', () => {
  const wrapper = shallow(<GenderChart results={[]} />);
  expect(wrapper.instance().state.data.datasets[0].data).toEqual([0, 0, 0]);
});

it('computes amounts correctly', () => {
  const wrapper = shallow(<GenderChart results={[]} />);
  wrapper.setProps({ results: data });
  const componentInstance = wrapper.instance();
  expect(componentInstance.state.data.datasets[0].data).toEqual([1, 2, 1]);
});
