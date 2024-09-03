// import React from 'react';
import { 
    // LineChart, 
    // Line, 
    ResponsiveContainer, 
    Tooltip, 
    YAxis, 
    XAxis, 
    // CartesianGrid, 
    AreaChart, 
    Area } from "recharts";

const TrackingChart = () => {

    const data = [
        {
          date: '10/12/2024',
          uv: 2500,
          pv: 2400,
          amt: 2400,
        },
        {
          date: '10/12/2024',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          date: '10/12/2024',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          date: '10/12/2024',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          date: '10/12/2024',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          date: '10/12/2024',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          date: '10/12/2024',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];

  return (
    <div className="w-full h-[160px]">

        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
            }}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="100%" stopColor="#114124" stopOpacity={1} />
                        <stop offset="100%" stopColor="#030B06" stopOpacity={1} />
                    </linearGradient>
                </defs>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="name" tick={false} />
                <YAxis tick={false} />
                <Tooltip />
                <Area type="monotone" dataKey="uv" stroke="#00C750" fill="url(#colorUv)" />
            </AreaChart>
            {/* <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="uv" stroke="rgba(0, 199, 80, 1)" />
                
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
            </LineChart> */}
        </ResponsiveContainer>
    </div>
  )
}

export default TrackingChart