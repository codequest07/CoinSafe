import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const SavingsPerformance = () => {

    const data = [
        {
          date: "10/12/2024",
          uv: 0,
          pv: 2400,
          amt: 2400,
        },
        {
          date: "10/12/2024",
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          date: "10/12/2024",
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          date: "10/12/2024",
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          date: "10/12/2024",
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          date: "10/12/2024",
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          date: "10/12/2024",
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];

  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-4">

        <div className="flex justify-between items-center p-2">
            <div className="text-[#CACACA]">Savings Performance</div>
            <div className="flex gap-2">
                <button className="rounded-[100px] px-4 py-1 bg-[#79E7BA] h-[40px] text-xs text-[#010104]">24h</button>
                <button className="rounded-[100px] px-4 py-1 bg-[#1E1E1E99] h-[40px] text-xs text-[#F1F1F1]">7D</button>
                <button className="rounded-[100px] px-4 py-1 bg-[#1E1E1E99] h-[40px] text-xs text-[#F1F1F1]">1M</button>
            </div>
        </div>

        <div className="w-full h-[160px] border-t-[1px] border-[#FFFFFF17]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
                }}>
                <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="100%" stopColor="#114124" stopOpacity={1} />
                    <stop offset="100%" stopColor="#030B06" stopOpacity={1} />
                </linearGradient>
                </defs>
                <XAxis
                dataKey="name"
                tick={false}
                axisLine={{ stroke: "#000000" }}
                padding={{ left: -70, right: -20 }}
                />
                <YAxis
                tick={false}
                padding={{ top: 0, bottom: -40 }}
                axisLine={{ stroke: "#000000" }}
                />
                <Tooltip />
                <Area
                type="monotone"
                dataKey="uv"
                stroke="#00C750"
                fill="url(#colorUv)"
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* SavingOption Modal */}
        {/* <SavingOption
            isFirstModalOpen={isFirstModalOpen}
            setIsFirstModalOpen={setIsFirstModalOpen}
            isSecondModalOpen={isSecondModalOpen}
            setIsSecondModalOpen={setIsSecondModalOpen}
        /> */}
        {/* </div> */}
    </div>
  )
}

export default SavingsPerformance