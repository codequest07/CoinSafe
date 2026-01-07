const FeatureCards = () => {
  return (
    <section className="px-4 sm:py-20 md:px-6 lg:px-8">
      <div className="sm:mx-auto sm:max-w-[75rem]">
        <div className="grid md:grid-cols-1 gap-10 items-center">
          <div className="space-y-4 max-w-[40rem] mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFD504] text-[#010104] text-[14px] font-[400]  tracking-wide w-fit">
              got goals?
            </span>
            <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-[500] uppercase text-[#F1F1F1] leading-tight">
              Smash your many money goals in one{" "}
              <span className="italic font-[100]">coool</span> place.
            </h2>
            <main className="flex items-center gap-4 justify-between">
              <div className="max-w-[24.5rem]">
                <p className="text-base sm:text-lg text-[#C6C6C6] max-w-2xl leading-relaxed">
                  We understand your goals and targets so we built a system to
                  help you organize and ace them all, easy peesy!
                </p>
              </div>
              <div className="pt-4">
                <button className="px-5 py-3 bg-[#FFFFFF] text-[#0F0F13] rounded-full text-sm font-medium shadow-sm">
                  Start saving
                </button>
              </div>
            </main>
          </div>
          <div className="relative flex justify-center">
            <img
              src="/assets/phones.svg"
              alt="Coinsafe app preview"
              className="w-full max-w-[520px] drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
