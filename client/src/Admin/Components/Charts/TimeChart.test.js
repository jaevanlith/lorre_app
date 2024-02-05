import React from 'react';
import { shallow } from 'enzyme';
import TimeChart from './TimeChart';
import { register } from 'timezone-mock';

// Mock the timezone
register('Europe/London');

describe('Plot before 12h', () => {
  it('has no data when no results', () => {
    const wrapper = shallow(<TimeChart results={[]} />);
    expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
  });

  it('sets check-in before 12h correctly', () => {
    const data = [{ date: '2020-12-12T23:00:00.000+00:00' }];

    const wrapper = shallow(<TimeChart results={[]} />);
    wrapper.setProps({ results: data });

    const dataPoints = [
      { t: new Date('2020-12-11'), y: 0 },
      { t: new Date('2020-12-12'), y: 1 },
      { t: new Date('2020-12-13'), y: 0 },
    ];

    expect(wrapper.instance().state.data.datasets[0].data).toEqual(dataPoints);
    expect(wrapper.instance().state.data.datasets[1].data).toEqual(dataPoints);
    expect(wrapper.instance().state.data.datasets[2].data).toEqual(dataPoints);
  });
});

describe('Plot before 1h', () => {
  it('has no data when no results', () => {
    const wrapper = shallow(<TimeChart results={[]} />);
    expect(wrapper.instance().state.data.datasets[1].data).toEqual([]);
  });

  it('sets check-in before 1h correctly', () => {
    const data = [{ date: '2020-12-12T00:30:00.000+00:00' }];

    const wrapper = shallow(<TimeChart results={[]} />);
    wrapper.setProps({ results: data });

    const dataPoints = [
      { t: new Date('2020-12-10'), y: 0 },
      { t: new Date('2020-12-11'), y: 1 },
      { t: new Date('2020-12-12'), y: 0 },
    ];

    expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
    expect(wrapper.instance().state.data.datasets[1].data).toEqual(dataPoints);
    expect(wrapper.instance().state.data.datasets[2].data).toEqual(dataPoints);
  });
});

describe('Plot total', () => {
  it('has no data when no results', () => {
    const wrapper = shallow(<TimeChart results={[]} />);
    expect(wrapper.instance().state.data.datasets[2].data).toEqual([]);
  });

  it('sets 1 check-in correctly', () => {
    const data = [{ date: '2020-12-13T01:30:00.000+00:00' }];

    const wrapper = shallow(<TimeChart results={[]} />);
    wrapper.setProps({ results: data });

    const dataPoints = [
      { t: new Date('2020-12-11'), y: 0 },
      { t: new Date('2020-12-12'), y: 1 },
      { t: new Date('2020-12-13'), y: 0 },
    ];

    expect(wrapper.instance().state.data.datasets[0].data).toEqual([]);
    expect(wrapper.instance().state.data.datasets[1].data).toEqual([]);
    expect(wrapper.instance().state.data.datasets[2].data).toEqual(dataPoints);
  });

  it('sets 2 check-ins on next day correctly', () => {
    const data = [{ date: '2020-12-13T01:30:00.000+00:00' }, { date: '2020-12-14T01:30:00.000+00:00' }];

    const wrapper = shallow(<TimeChart results={[]} />);
    wrapper.setProps({ results: data });

    const dataPoints = [
      { t: new Date('2020-12-11'), y: 0 },
      { t: new Date('2020-12-12'), y: 1 },
      { t: new Date('2020-12-13'), y: 1 },
      { t: new Date('2020-12-14'), y: 0 },
    ];

    expect(wrapper.instance().state.data.datasets[2].data).toEqual(dataPoints);
  });

  it('sets 2 check-ins on same day correctly', () => {
    const data = [{ date: '2020-12-13T01:00:00.000+00:00' }, { date: '2020-12-13T01:30:00.000+00:00' }];

    const wrapper = shallow(<TimeChart results={[]} />);
    wrapper.setProps({ results: data });

    const dataPoints = [
      { t: new Date('2020-12-11'), y: 0 },
      { t: new Date('2020-12-12'), y: 2 },
      { t: new Date('2020-12-13'), y: 0 },
    ];

    expect(wrapper.instance().state.data.datasets[2].data).toEqual(dataPoints);
  });
});
