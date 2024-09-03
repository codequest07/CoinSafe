
const GasCoverageCard = ({ 
    title, 
    icon, 
    value, 
    per,
    unit,
    badge, 
    emphasize, 
    text }:{
        title: string, 
        icon?:any, 
        value: number, 
        per: number,
        unit: string, 
        badge?: string,
        emphasize?: string, 
        text: string
}) => {
  return (
    <div className='border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full'>
        <div className='flex justify-between items-center pb-4'>
            <div className='text-[#CACACA] font-light'>{title}</div>
            <div>
                {icon ? 
                    <div>{icon}</div> 
                : 
                    badge && 
                        
                            <div className='text-[#F1F1F1] rounded-[10px] bg-[#79E7BA17] px-2 py-1 text-xs'>
                                {badge}
                            </div>
                }
            </div>
        </div>
        <div>
            <span className='text-[#F1F1F1] pr-2'>
                ${value.toLocaleString('en-US')}/${per}
            </span>
            <span className='text-[#CACACA] text-xs'>{unit}</span>
        </div>
        <div>
            <div className='pt-2'>
                <p className='text-[#7F7F7F] text-xs'>
                    <span className='text-[#79E7BA] underline'>{emphasize} </span>
                    {text}
                </p>
            </div>
        </div>
    </div>
  )
}

export default GasCoverageCard