type Props = {
  className?: string;
};

const UsdtSavingsBanner = ({ className = "" }: Props) => (
  <div
    className={`mb-6 rounded-[6px] bg-[#FFA3481A] text-[#FFA448] px-4 py-3 text-sm flex flex-col items-center justify-center gap-3 ${className}`}>
    <div className="w-4 h-4">
      {/* using emoji to avoid extra icon import; swap if design requires */}
      <span role="img" aria-label="alert">
        ⚠️
      </span>
    </div>
    <p className="leading-relaxed text-[12px] text-center">
      We recommend swapping your USDT to USDT0 to enjoy our savings rewards.
      While you can still save in USDT, saving in USDT0 allows you to earn the
      rewards. We are working hard to ensure you can save and earn in USDT in
      the nearest future!
    </p>
  </div>
);

export default UsdtSavingsBanner;
