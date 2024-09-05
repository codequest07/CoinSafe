import Navbar from "@/components/Navbar";
import CoinSafeLogo from "@/icons/AppLogo";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <main>
        <Navbar />

        <div
          className="
                max-w-[1240px] mx-auto rounded-[12px] relative 
                flex justify-center border-[1px] border-[#FFFFFF17]
                h-[700px] bg-gradient-to-tl from-[#48FF9169] via-[#0D1E15] to-[#0F271B] bg-no-repeat
                bg-bottom mt-6 bg-blend-overlay"
          style={{
            backgroundBlendMode: "overlay",
          }}>
          <div className="absolute bottom-0">
            <img src="/assets/hero-image.svg" alt="hero" />
          </div>
          <div className="pt-[100px] flex flex-col items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl text-[#F1F1F1]">
                Spend and save like a total chad
              </h1>
            </div>
            <div className="max-w-[500px] pt-6">
              <p className="text-[#CACACA] text-lg lg:text-xl text-center">
                Experience seamless savings, AI-powered insights, and a sprinkle
                of blockchain magic—built on Lisk
              </p>
            </div>
            <div className="flex gap-4 pt-10">
              <button
                onClick={() => navigate("/extension")}
                className="bg-[#1E1E1E99] text-[#F1F1F1] px-10 py-5 rounded-[100px]">
                Download extension
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-[#FFFFFFE5] text-[#010104] px-10 py-5 rounded-[100px]">
                Launch app
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="max-w-[1240px] mx-auto">
            <div className="pt-[200px]">
              <h2 className="text-5xl text-[#F1F1F1] text-center">
                CoinSafe is changing the game for good...
              </h2>
            </div>
            <div className="text-[white] pt-20">
              <div className="flex">
                <div className="w-[70%] rounded-[12px] border-[1px] border-[#FFFFFF17] p-20">
                  <div className="flex flex-col justify-center items-center">
                    <div>
                      <img src="/assets/whisper.svg" alt="Whisper" />
                    </div>
                    <div className="flex flex-col justify-center items-center">
                      <div>Spend and save with Whisper</div>
                      <div className="text-center w-[279px]">
                        Spend and save like a total chad. Whisper automatically
                        locks in savings every time you make a move.
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => navigate("/extension")}
                        className="bg-[#1E1E1E99] text-[#F1F1F1] 
                                            px-6 py-3 rounded-[100px]">
                        Download extension
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-end w-1/2 border-[1px] border-[#FFFFFF17] rounded-[12px] p-20">
                  <div>
                    <img src="/assets/whisper-device.svg" alt="" />
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="w-1/2">
                  <div className="rounded-[12px] border-[1px] border-[#FFFFFF17] p-20">
                    <div className="flex flex-col justify-center items-center">
                      <div>
                        <img src="/assets/savesense.svg" alt="Whisper" />
                      </div>
                      <div className="flex flex-col justify-center items-center">
                        <div>Smart savings with SaveSense</div>
                        <div className="text-center w-[279px]">
                          {
                            "Our AI isn’t just smart—it’s a wealth wizard. It analyzes your spending and crafts a savings plan that’s borderline genius."
                          }
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="bg-[#1E1E1E99] text-[#F1F1F1] 
                                                px-6 py-3 rounded-[100px]">
                          Start saving
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="rounded-[12px] border-[1px] border-[#FFFFFF17] p-20">
                    <div className="flex flex-col justify-center items-center">
                      <div>
                        <img src="/assets/schedule.svg" alt="Whisper" />
                      </div>
                      <div className="flex flex-col justify-center items-center">
                        <div>Smart savings with SaveSense</div>
                        <div className="text-center w-[279px]">
                          {
                            "Schedule your savings directly on the blockchain. Set it, forget it, and watch your funds grow securely."
                          }
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="bg-[#1E1E1E99] text-[#F1F1F1] 
                                                px-6 py-3 rounded-[100px]">
                          Start saving
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="">
            <div className="flex justify-between items-center pt-[200px] pb-[80px]">
              <div className="text-[40px] text-[#F1F1F1] max-w-[658px]">
                Track your progress, manage your savings, and stay in control
              </div>
              <div>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-[#1E1E1E99] text-[#F1F1F1] 
                                                px-6 py-3 rounded-[100px]">
                  Get Started
                </button>
              </div>
            </div>
            <div>
              <img src="/assets/dashboard-image.svg" alt="" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-center">
            <div>
              <div className="pt-[100px] flex flex-col items-center">
                <div>
                  <h1 className="text-4xl lg:text-5xl text-[#F1F1F1]">
                    Built on trust, powered by security
                  </h1>
                </div>
                <div className="max-w-[550px] pt-6">
                  <p className="text-[#CACACA] text-md text-center">
                    Your savings are protected by blockchain technology,
                    ensuring every transaction is secure and transparent. With
                    no middlemen and full visibility.
                  </p>
                </div>
                <div className="flex gap-4 pt-10">
                  <button
                    onClick={() => navigate("/extension")}
                    className="bg-[#1E1E1E99] text-[#F1F1F1] px-10 py-5 rounded-[100px]">
                    Download extension
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-[#FFFFFFE5] text-[#010104] px-10 py-5 rounded-[100px]">
                    Launch app
                  </button>
                </div>
              </div>
            </div>

            <div>
              <img src="/assets/galaxy.svg" alt="" />
            </div>
          </div>
        </div>

        <footer className="border-[1px] border-[#FFFFFF17]">
          <div className="flex justify-between items-center max-w-[1240px] mx-auto">
            <div className="py-[32px]">
              <CoinSafeLogo />
            </div>
            <div className="flex">
              <div className="border-x-[1px] border-x-[#FFFFFF17] py-[18px] px-[50px]">
                <img src="/assets/discord.svg" alt="" />
              </div>
              <div className="border-x-[1px] border-x-[#FFFFFF17] py-[18px] px-[50px]">
                <img src="/assets/x.svg" alt="" />
              </div>
              <div className="border-x-[1px] border-x-[#FFFFFF17] py-[18px] px-[50px]">
                <img src="/assets/telegram.svg" alt="" />
              </div>
            </div>
          </div>
        </footer>

        {/* <div className="relative h-screen overflow-hidden">
                <div className="absolute inset-0 bg-no-repeat bg-contain 
                            bg-fixed parallax-bg"
                    style={{backgroundImage: `url(
        '/assets/hero-image.svg')`}}>
                </div>
                <div className="absolute inset-0 flex justify-center items-center">
                    <div className="text-center bg-green-400 mt-4">
                        <h1 className="text-3xl text-white mt-5">
                            Welcome to Tailwind CSS Parallax Effect
                        </h1>
                        <p className="text-lg text-white mt-5 ml-4">
                            Elevate your web design with stunning parallax effects
                            using Tailwind CSS. Impress your visitors and create
                            engaging
                            user experiences with minimal effort. Whether you're a
                            beginner
                            or an experienced developer, Tailwind CSS makes it easy to
                            implement parallax scrolling and bring your designs to life.
                        </p>
                    </div>
                </div>
            </div> */}
        {/* <div className="relative h-screen overflow-hidden">
                <div className="absolute inset-0 bg-no-repeat bg-cover 
                            bg-fixed parallax-bg"
                    style={{backgroundImage: `url(
        'https://media.geeksforgeeks.org/wp-content/uploads/20240308154939/html-(1).jpg')`}}>
                </div>
                <div className="absolute inset-0 flex justify-center items-center">
                    <div className="text-center">
                        <h1 className="text-4xl text-green-300">HTML</h1>
                        <p className="text-lg text-white">
                            Tailwind CSS is a utility-first CSS framework that allows
                            you to build custom designs rapidly. With its intuitive
                            className-based approach, you can easily create responsive 
                            and visually appealing layouts without writing custom CSS. 
                            Tailwind provides a comprehensive set of pre-built utility 
                            classNamees for styling elements,making it easy
                            to customize every aspect of your design.
                            Whether you're a beginner or an experienced developer,
                            Tailwind CSS empowers you to create modern and beautiful
                            websites
                            with ease.
                        </p>
                    </div>
                </div>
            </div> */}
        {/* <div className="h-96 bg-green-500 w-full">
                <div className="flex flex-col justify-center 
                            items-center h-full">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Experience the Parallax Effect
                    </h2>
                    <p className="text-lg text-white ml-4">
                        Discover the mesmerizing world of parallax scrolling with
                        Tailwind CSS.
                        Create stunning visual effects and captivate your audience with
                        immersive web experiences. Whether you're building a portfolio,
                        showcasing products, or telling a story, parallax adds depth
                        and intrigue to your website.
                    </p>
                </div>
            </div> */}
      </main>
    </div>
  );
};

export default LandingPage;
