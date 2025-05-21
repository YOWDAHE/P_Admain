"use client"

import { useEffect, useState } from "react"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface AnalyticsChartProps {
  type: "events" | "users" | "revenue"
  data: Record<string, number>
  detailed?: boolean
}

export function AnalyticsChart({ type, data, detailed = false }: AnalyticsChartProps) {
  const [lineChartData, setLineChartData] = useState<ChartData<"line", number[], string>>({
    labels: [],
    datasets: [],
  })

  const [barChartData, setBarChartData] = useState<ChartData<"bar", number[], string>>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const labels = Object.keys(data)
    const values = Object.values(data)

    let backgroundColor = ""
    let borderColor = ""
    let label = ""

    switch (type) {
      case "events":
        backgroundColor = "rgba(59, 130, 246, 0.5)"
        borderColor = "rgb(59, 130, 246)"
        label = "Events"
        break
      case "users":
        backgroundColor = "rgba(16, 185, 129, 0.5)"
        borderColor = "rgb(16, 185, 129)"
        label = "Users"
        break
      case "revenue":
        backgroundColor = "rgba(249, 115, 22, 0.5)"
        borderColor = "rgb(249, 115, 22)"
        label = "Revenue ($)"
        break
    }

    const chartData = {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    }

    setLineChartData(chartData as ChartData<"line", number[], string>)
    setBarChartData(chartData as ChartData<"bar", number[], string>)
  }, [type, data, detailed])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} Analytics`,
      },
    },
  }

  return detailed ? <Bar data={barChartData} options={options} /> : <Line data={lineChartData} options={options} />
}
