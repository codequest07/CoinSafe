const stats = [
  { value: "100+", label: "Unique wallets" },
  { value: "100+", label: "Dollars locked" },
  { value: "5+", label: "Audits passed" },
];

const StatsStrip = () => {
  return (
    <section className="bg-[#0C1714] text-[#F1F1F1] py-12 sm:py-14 md:py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 text-center gap-8 sm:gap-6">
        {stats.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="text-[56px] sm:text-[80px] font-bold leading-none">
              {item.value}
            </div>
            <div className="text-sm sm:text-[20px] font-[300] uppercase tracking-wide text-[#CACACA]">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
