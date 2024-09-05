
const CoverageRewardCard = ({ ImgSrc }:{ImgSrc: string}) => {
  return (
    <div className="flex flex-col justify-center items-center p-6 bg-[#131313B2] max-w-[222px] rounded-[12px]">
        <div>
            <img src={ImgSrc} alt="coverage reward" />
        </div>
        <div className="flex flex-col justify-center items-center">
            <div className="text-[#CACACA] text-xs">Original sage</div>
            <div className="py-2">
                <button className="px-4 py-[6px] text-sm text-[#FCFCFC] bg-[#79E7BA17] rounded-[100px]">$2 gas coverage</button>
            </div>
            <div className="text-[#7F7F7F] text-xs">
                exhausted
            </div>
        </div>
    </div>
  )
}

export default CoverageRewardCard