import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { differenceInYears } from 'date-fns';

/** Class for displaying age analytics chart to the admin */
class AgeChart extends Component {
  state = {
    data: {
      labels: [],
      datasets: [
        {
          label: 'Leeftijd',
          data: [],
          backgroundColor: ['rgba(54, 162, 235, 0.7)'],
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Aantal',
              fontSize: 30,
            },
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
    },
  };

  /**
   * This method sets the ages as labels and computes the amounts.
   */
  componentDidMount() {
    let dataCopy = this.state.data;

    // Create map that will store (age, count) pairs
    let map = new Map();

    // Init min and max age
    let minAge = Number.MAX_VALUE;
    let maxAge = Number.MIN_VALUE;

    // Iterate over query results
    this.props.results.forEach((checkIn) => {
      if (checkIn.userId) {
        if (checkIn.userId.dateOfBirth) {
          // Compute age
          const age = differenceInYears(Date.now(), new Date(checkIn.userId.dateOfBirth));

          // Increment counter for that age
          if (map.has(age)) {
            map.set(age, map.get(age) + 1);
          } else {
            map.set(age, 1);
            // Check for min and max age
            if (age < minAge) minAge = age;
            if (age > maxAge) maxAge = age;
          }
        }
      }
    });

    // Create labels  and data array
    let labels = [];
    let data = [];
    // Iterate over age interval
    for (let i = minAge; i <= maxAge; i++) {
      // Push age as label
      labels.push(i);
      // Push count as data
      if (map.has(i)) {
        data.push(map.get(i));
      } else {
        data.push(0);
      }
    }

    // Set state to computed labels and data
    dataCopy.labels = labels;
    dataCopy.datasets[0].data = data;
    this.setState({
      data: dataCopy,
    });
  }

  /**
   * This method ensures that the labels and amounts are re-computed, when the props change.
   * @param prevProps
   * @param prevState
   */
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.results !== this.props.results) {
      this.componentDidMount();
    }
  }

  render() {
    return (
      <div data-testid="age-chart">
        <div className="chart-title-box">
          <p className="chart-title">Leeftijd</p>
        </div>

        <div className="chart-box">
          <Line data={this.state.data} width={300} height={300} options={this.state.options} />
        </div>
      </div>
    );
  }
}

export default AgeChart;
