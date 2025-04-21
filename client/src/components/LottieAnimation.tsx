// import { useState, useEffect } from "react";

// const LottieAnimation = () => {
//   const [animationData, setAnimationData] = useState(null);

//   useEffect(() => {
//     fetch(
//       "https://lottie.host/44e1c5f8-9d0e-4363-bc49-dd664ca9ca76/rHKoiYfmYN.json"
//     )
//       .then((res) => res.json())
//       .then((data) => setAnimationData(data));
//   }, []);

//   if (!animationData) return <div>Loading...</div>;

//   return (
//     <Lottie
//       animationData={animationData}
//       loop={true}
//       autoplay={true}
//       style={{
//         width: "100%",
//         height: "auto",
//         maxWidth: "250px",
//         margin: "auto",
//       }}
//     />
//   );
// };

// export default LottieAnimation;
