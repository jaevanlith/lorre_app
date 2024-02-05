import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';

/** Class for displaying university or city analytics chart to the admin */
class UniCityChart extends Component {
  constructor(props) {
    super(props);

    const category = this.props.category === 'university' ? 'Onderwijsinstelling' : 'Woonplaats';

    this.state = {
      data: {
        labels: [],
        datasets: [
          {
            label: category,
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
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
  }

  /**
   * This method retrieves the labels and their amounts.
   */
  componentDidMount() {
    let dataCopy = this.state.data;

    // Create map that will store (uni/city, count) pairs
    let map = new Map();

    // Iterate over query results
    this.props.results.forEach((checkIn) => {
      if (checkIn.userId) {
        // Get value
        let val = '';
        if (this.props.category === 'university') {
          val = checkIn.userId.university;
        } else {
          val = checkIn.userId.city;
        }

        if (val) {
          // Increment counter for that uni/city
          if (map.has(val)) {
            map.set(val, map.get(val) + 1);
          } else {
            map.set(val, 1);
          }
        }
      }
    });

    // Create labels  and data array
    let labels = [];
    let data = [];
    // Split map into arrays
    map.forEach((count, label) => {
      labels.push(label);
      data.push(count);
    });

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
      <div data-testid={this.props.category + '-chart'}>
        <div className="chart-title-box">
          <p data-testid="title" className="chart-title">
            {this.props.category === 'university' ? 'Onderwijsinstelling' : 'Woonplaats'}
          </p>
        </div>

        <div className="chart-box">
          <Bar data={this.state.data} width={300} height={300} options={this.state.options} />
        </div>
      </div>
    );
  }
}

export default UniCityChart;
