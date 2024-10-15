import React, { useState, useEffect } from "react";

const apologies = [
  "I didn’t mean to make things hard for you",
  "I’m really sorry for what happened",
  "I feel bad about what I did",
  "I wish I hadn’t done that",
  "I didn’t think it through and now I regret it",
  "I know I messed up and I’m sorry",
  "I didn’t mean to hurt you with my actions",
  "I hope you can forgive me for what happened",
  "I should have known better, I’m sorry",
  "I’ve been thinking about it and I feel terrible",
  "I just want to say I’m really sorry",
  "I didn’t realize how much it would affect you",
  "I wish I could take it back",
  "I feel really bad for what I did",
  "I wasn’t thinking, and I regret it",
  "I know this isn’t what you deserve, I’m sorry",
  "I shouldn’t have done that, and I realize that now",
  "I know I was wrong, and I’m sorry",
  "I regret my actions and wish I could change them",
  "I hope we can move past this",
  "I’ve been reflecting on it, and I’m really sorry",
  "I feel bad about how things turned out",
  "I wish I hadn’t made that mistake",
  "I didn’t mean to make things worse",
  "I hope we can get through this together",
  "I wasn’t careful enough and now I’m sorry",
  "I didn’t think about the impact, I’m really sorry",
  "I’ve made a mistake, and I want to make it right",
  "I understand how you feel and I’m sorry",
  "I didn’t mean for things to go this way",
  "I regret what I did and I hope you understand"
];

const randomPosition = () => ({
  top: `${Math.random() * 100}vh`,
  left: `${Math.random() * 100}vw`
});

const SowwyProto: React.FC = () => {
  const [apology, setApology] = useState<string>("");
  const [bubblePosition, setBubblePosition] = useState(randomPosition);

  useEffect(() => {
    const randomApology = apologies[Math.floor(Math.random() * apologies.length)];
    setApology(randomApology);

    const interval = setInterval(() => {
      setBubblePosition(randomPosition);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-screen bg-[#0F172A] overflow-hidden">
      <div
        className="absolute w-72 h-72 bg-pink-500 rounded-full opacity-50 blur-3xl animate-ping-slow"
        style={{ top: bubblePosition.top, left: bubblePosition.left }}
      ></div>

      <div className="relative bg-[#1E293B] text-center p-8 rounded-lg shadow-lg max-w-md border-4 border-transparent hover:border-red-400 transition-all duration-300">
        <h1 className="text-5xl font-bold text-red-400 mb-6 animate-pulse">Sowwy :(</h1>
        <p className="text-xl text-gray-300 mb-6 animate-fadeIn">{apology}</p>
        <p className="text-sm text-gray-400 italic mb-4">
          I’m trying my best to make things right, love Thanks for being so patient
        </p>
        <p className="text-xs text-gray-500">
          (Refresh the page to hear more of my heartfelt apologies)
        </p>

        <div className="absolute inset-0 border-4 border-pink-500 rounded-lg opacity-20 animate-pulse-slow"></div>
      </div>
    </div>
  );
};

export default SowwyProto;
