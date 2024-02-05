import React, { Component } from 'react';
import { Pie } from 'react-chartjs-2';

/** Class for displaying gender analytics chart to the admin */
class GenderChart extends Component {
  state = {
    data: {
      labels: ['Man', 'Vrouw', 'Anders'],
      datasets: [
        {
          label: 'Geslacht',
          data: [0, 0, 0],
          backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'],
        },
      ],
    },
  };

  /**
   * This method computes the amounts and stores it in the state.
   */
  componentDidMount() {
    let dataCopy = this.state.data;
    // Set initial amounts to 0
    let data = [0, 0, 0];

    // Iterate over array and increment amounts
    this.props.results.forEach((checkIn) => {
      if (checkIn.userId) {
        if (checkIn.userId.gender === 'male') {
          data[0]++;
        } else if (checkIn.userId.gender === 'female') {
          data[1]++;
        } else {
          data[2]++;
        }
      }
    });

    // Set the data to the state
    dataCopy.datasets[0].data = data;
    this.setState({
      data: dataCopy,
    });
  }

  /**
   * This method ensures that the amounts are re-computed, when the props change.
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
      <div data-testid="gender-chart">
        <div className="chart-title-box">
          <p className="chart-title">Geslacht</p>
        </div>

        <div className="chart-box">
          <Pie
            data={this.state.data}
            width={300}
            height={300}
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    );
  }
}

export default GenderChart;
