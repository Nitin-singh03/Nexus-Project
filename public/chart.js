const ctx = document.getElementById('barchart').getContext('2d');
let chartType = 'bar'; // Initially set to 'bar'

// Initial chart data
const Crop1datset = {
  labels: ["2016 q1", "2016 q2", "2016 q3", "2016 q4", "2017 q1", "2017 q2", "2017 q3", "2017 q4", "2018 q1", "2018 q2", "2018 q3", "2018 q4", "2019 q1", "2019 q2", "2019 q3", "2019 q4", "2020 q1", "2020 q2", "2020 q3", "2020 q4", "2021 q1", "2021 q2", "2021 q3", "2021 q4", "2022 q1", "2022 q2", "2022 q3", "2022 q4", "2023 q1", "2023 q2", "2023 q3", "2023 q4"]
  ,
  datasets: [{
    label: 'Soyabean',
    data: [3100, 3525, 3495, 2690, 3278, 3525, 3495, 2625, 3407, 3012, 2995, 2775, 3430, 3461, 3508, 3465, 3237, 3595, 3450, 4125, 4125, 6650, 8150, 6400, 7036, 5975, 5101, 4575, 3075, 4815, 2988, 4695]
    ,
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',

    ],
    borderColor: [
      'rgb(255, 99, 132)',

    ],
    borderWidth: 1
  }]
};
const Crop2datset = {
  labels: ["2016 q1", "2016 q2", "2016 q3", "2016 q4", "2017 q1", "2017 q2", "2017 q3", "2017 q4", "2018 q1", "2018 q2", "2018 q3", "2018 q4", "2019 q1", "2019 q2", "2019 q3", "2019 q4", "2020 q1", "2020 q2", "2020 q3", "2020 q4", "2021 q1", "2021 q2", "2021 q3", "2021 q4", "2022 q1", "2022 q2", "2022 q3", "2022 q4", "2023 q1", "2023 q2", "2023 q3", "2023 q4"]
  ,
  datasets: [{
    label: 'Cotton',
    data: [4450, 5900, 5442, 5063, 5060, 5250, 4917, 4613, 4500, 4500, 4475, 4300, 5300, 5310, 5200, 5150, 5400, 5387, 5310, 5250, 5500, 7089, 8120, 8325, 9525, 10950, 11200, 10896, 9176, 10280, 10835, 11180]
    ,
    backgroundColor: [

      'rgba(255, 159, 64, 0.2)',

    ],
    borderColor: [

      'rgb(255, 159, 64)',

    ],
    borderWidth: 1
  }]
};
const Crop3datset = {
  labels: ["2016 q1", "2016 q2", "2016 q3", "2016 q4", "2017 q1", "2017 q2", "2017 q3", "2017 q4", "2018 q1", "2018 q2", "2018 q3", "2018 q4", "2019 q1", "2019 q2", "2019 q3", "2019 q4", "2020 q1", "2020 q2", "2020 q3", "2020 q4", "2021 q1", "2021 q2", "2021 q3", "2021 q4", "2022 q1", "2022 q2", "2022 q3", "2022 q4", "2023 q1", "2023 q2", "2023 q3", "2023 q4"]
,
datasets: [{
  label: 'Wheat',
  data: [1775, 1775, 1925, 2075, 2000, 1760, 1850, 1850, 1800, 1760, 1850, 1850, 2125, 2000, 2000, 2525, 2475, 1725, 1750, 1650, 1550, 1700, 1712, 1950, 1988, 2075, 2275, 2300, 2387, 2225, 2400, 2462]
  ,
  backgroundColor: [

    'rgba(255, 205, 86, 0.2)',

  ],
  borderColor: [

    'rgb(255, 205, 86)',

  ],
  borderWidth: 1
}]
};
const Crop4datset = {

  labels: ["2016 q1", "2016 q2", "2016 q3", "2016 q4", "2017 q1", "2017 q2", "2017 q3", "2017 q4", "2018 q1", "2018 q2", "2018 q3", "2018 q4", "2019 q1", "2019 q2", "2019 q3", "2019 q4", "2020 q1", "2020 q2", "2020 q3", "2020 q4", "2021 q1", "2021 q2", "2021 q3", "2021 q4", "2022 q1", "2022 q2", "2022 q3", "2022 q4", "2023 q1", "2023 q2", "2023 q3", "2023 q4"]
  ,
  datasets: [{
    label: 'Bajra',
    data : [1785, 1800, 1950, 2075, 1735, 1750, 1725, 1900, 1750, 1700, 1900, 1800, 2025, 1650, 2200, 2350, 2500, 1720, 1810, 1850, 1850, 2100, 1700, 1850, 1850, 1900, 1950, 1780, 1820, 1985, 2010, 1870]
    ,
    backgroundColor: [

      'rgba(75, 192, 192, 0.2)',

    ],
    borderColor: [

      'rgb(75, 192, 192)',

    ],
    borderWidth: 1
  }]
};
const Crop5datset = {
  labels: ["2016 q1", "2016 q2", "2016 q3", "2016 q4", "2017 q1", "2017 q2", "2017 q3", "2017 q4", "2018 q1", "2018 q2", "2018 q3", "2018 q4", "2019 q1", "2019 q2", "2019 q3", "2019 q4", "2020 q1", "2020 q2", "2020 q3", "2020 q4", "2021 q1", "2021 q2", "2021 q3", "2021 q4", "2022 q1", "2022 q2", "2022 q3", "2022 q4", "2023 q1", "2023 q2", "2023 q3", "2023 q4"]

  ,datasets: [{
    label: 'Maize',
    data : [1110, 1450, 1410, 1325, 1325, 1350, 1288, 1075, 1100, 1050, 1200, 1275, 1750, 1550, 2088, 1775, 1825, 1450, 1210, 1000, 1313, 1225, 1462, 1425, 1513, 1825, 1850, 1925, 2050, 2025, 2050, 1900]
,
    backgroundColor: [

      'rgba(54, 162, 235, 0.2)',

    ],
    borderColor: [

      'rgb(54, 162, 235)',

    ],
    borderWidth: 1
  }]
};
// Create initial chart
let chart = new Chart(ctx, {
    type: chartType,
    data: Crop1datset,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
// Function to update the chart type
function updateChartType() {
  chart.destroy(); // Destroy the old chart
  chartType = chartType === 'bar' ? 'line' : 'bar'; // Toggle between 'bar' and 'line'
    chart = new Chart(ctx, {
    type: chartType,
    data: chart.data, // Keep the same data
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
// Function to update the chart data
// Function to reset the chart data to the initial state
function Crop1func() {
  chart.data= Crop1datset; // Reset to initial datasets
  chart.update(); // Refresh the chart
}
function Crop2func() {
  chart.data = Crop2datset; // Reset to initial datasets
  chart.update(); // Refresh the chart
}
function Crop3func() {
  chart.data = Crop3datset; // Reset to initial datasets
  chart.update(); // Refresh the chart
}
function Crop4func() {
  chart.data = Crop4datset; // Reset to initial datasets
  chart.update(); // Refresh the chart
}
function Crop5func() {
  chart.data= Crop5datset; // Reset to initial datasets
  chart.update(); // Refresh the chart
}
// Event listeners for all three buttons
document.getElementById('changeChart').addEventListener('click', updateChartType);
document.getElementById('Crop1').addEventListener('click', Crop1func);
document.getElementById('Crop2').addEventListener('click', Crop2func);
document.getElementById('Crop3').addEventListener('click', Crop3func);
document.getElementById('Crop4').addEventListener('click', Crop4func);
document.getElementById('Crop5').addEventListener('click', Crop5func);