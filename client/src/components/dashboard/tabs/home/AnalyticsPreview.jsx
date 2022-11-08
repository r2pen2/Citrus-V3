// Library imports
import { Stack, Button } from "@mui/material"
import { Bar } from "react-chartjs-2";
// eslint-disable-next-line no-unused-vars
import Chart from 'chart.js/auto';
import { RouteManager } from "../../../../api/routeManager";

/**
 * I honestly don't really know what's going on here.
 * We can figure something out for the analytics component
 * once we're actually storing user data. It may also be better
 * to use a different library to display the chart, becuase
 * this one doesn't seem to let us display values as currency.
 */

export default function Analytics({ chartData }) {
    // Data to be represented by the bar chart
    const data = {
        labels: chartData.map((data) => data.month),
        datasets: [{
            data: chartData.map((data) => data.amount),
            label: "Spending",
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }],
    }

    return (
        <Stack className="analytics-preview-wrapper">
            <div className="chart-container">
                <Bar 
                data={data} 
                options={{ 
                    plugins: {
                        legend: {
                            display: true
                        },
                    },
                    scales: {
                         y: {
                             beginAtZero: true 
                        }
                    }
                    }
                }/>
            </div>
            <div className="btn">
                <Button variant="contained" onClick={() => RouteManager.redirectWithHash("dashboard", "analytics")}>See More</Button>
            </div>
        </Stack>
    );
}
