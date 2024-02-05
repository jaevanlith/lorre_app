import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { format, addDays, getHours } from 'date-fns';

/** Class for displaying time distribution analytics chart to the admin */
class TimeChart extends Component {
  state = {
    data: {
      datasets: [
        {
          label: 'Check-ins voor 12u',
          data: [],
          backgroundColor: ['rgb(152, 251, 152, 0.7)'],
        },
        {
          label: 'Check-ins voor 1u',
          data: [],
          backgroundColor: ['rgba(255, 206, 86, 0.7)'],
        },
        {
          label: 'Totaal aantal check-ins',
          data: [],
          backgroundColor: ['rgba(54, 162, 235, 0.7)'],
        },
      ],
    },
    options: {
      elements: {
        line: {
          tension: 0,
        },
        point: {
          radius: 0,
        },
      },
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
        xAxes: [
          {
            type: 'time',
            time: {
              minUnit: 'day',
            },
          },
        ],
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
      },
    },
  };

  /**
   * This method sets the ages as labels and computes the amounts.
   */
  componentDidMount() {
    let dataCopy = this.state.data;

    // Create maps that will store (date, count) pairs
    let mapBeforeTwelve = new Map();
    let mapBeforeOne = new Map();
    let mapTotal = new Map();

    // Iterate over query results
    this.props.results.forEach((checkIn) => {
      // Convert to date and store hour of the day
      let dateTime = new Date(checkIn.date);
      const hour = getHours(dateTime);
      // Check-ins after 12h are considered as part of the day before
      if (hour !== 23) {
        dateTime = addDays(dateTime, -1);
      }
      // Convert to string to make comparing as map keys possible
      const date = format(dateTime, 'yyyy-MM-dd');

      // Check whether check-in was before 00:00
      // Opening time is 23:00, so check for 23:00 to 23:59
      if (hour === 23) {
        this.incrementMapValue(mapBeforeTwelve, date);
      }
      // Check whether check-in was before 1h (23:00 to 00:59)
      if (hour === 23 || hour === 0) {
        this.incrementMapValue(mapBeforeOne, date);
      }
      this.incrementMapValue(mapTotal, date);
    });

    // Map the (date, amount) pairs into arrays
    let dataBeforeTwelve = this.convertMapToData(mapBeforeTwelve);
    let dataBeforeOne = this.convertMapToData(mapBeforeOne);
    let dataTotal = this.convertMapToData(mapTotal);

    // Set state to computed data
    dataCopy.datasets[0].data = dataBeforeTwelve;
    dataCopy.datasets[1].data = dataBeforeOne;
    dataCopy.datasets[2].data = dataTotal;
    this.setState({
      data: dataCopy,
    });
  }

  /**
   * This method increments the amount of check-ins at the specified date.
   * @param map, the map in which it should be saved
   * @param date, the date of the check-in
   */
  incrementMapValue = (map, date) => {
    // Check if day before is defined, if not: add point with 0 to make plotted line correct
    const dayBefore = format(addDays(new Date(date), -1), 'yyyy-MM-dd');
    if (!map.has(dayBefore)) {
      map.set(dayBefore, 0);
    }

    // Either increment amount for the date, or define new pair
    if (map.has(date)) {
      map.set(date, map.get(date) + 1);
    } else {
      map.set(date, 1);
    }

    // Check if day after is defined, if not: add point with 0 to make plotted line correct
    const dayAfter = format(addDays(new Date(date), 1), 'yyyy-MM-dd');
    if (!map.has(dayAfter)) {
      map.set(dayAfter, 0);
    }
  };

  /**
   * This method converts a map into the data format required for Chart js.
   * @param map, the map to be converted
   * @returns {Array}, the array with elements like: {t: date, y: amount}
   */
  convertMapToData = (map) => {
    let data = [];
    map.forEach((amount, date) => {
      data.push({
        t: new Date(date),
        y: amount,
      });
    });
    return data;
  };

  /**
   * This method ensures that the data is re-computed, when the props change.
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
      <div data-testid="time-chart">
        <div className="chart-title-box">
          <p className="chart-title">Tijdsverdeling</p>
        </div>

        <div className="chart-box">
          <Line data={this.state.data} width={300} height={300} options={this.state.options} />
        </div>
      </div>
    );
  }
}

export default TimeChart;
