const FeatureCards = () => {
  return (
    <section className="px-4 sm:py-16 md:px-6 lg:px-8">
      <div className="sm:mx-auto sm:max-w-[75rem]">
        {/* Header */}
        <div className="mb-0 grid gap-8 md:grid-cols-2 md:gap-12 lg:mb-24">
          <h2
            style={{
              background: "linear-gradient(to right, #F1F1F1, #8B8B8B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            className="sm:text-[44px] text-4xl font-medium tracking-tight">
            Discover an efficient way to save towards your goals
          </h2>
          <p
            style={{
              background: "linear-gradient(to right, #F1F1F1, #8B8B8B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            className="sm:text-base font-[400]  md:pt-4">
            Coinsafe helps you achieve more with your money by making saving.
            Whether you’re a beginner or a pro, our tools are designed to meet
            you where you are and help you grow.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
