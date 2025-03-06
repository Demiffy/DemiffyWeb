import { useState, useEffect } from 'react';

const MainIntro = () => {
  const [arrowVisible, setArrowVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setArrowVisible(false);
      } else {
        setArrowVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center items-center">
      <div className="profile-container bg-slate-800 p-6 rounded-full shadow-lg mb-6">
        <img
          src="/clouds.png"
          alt="Profile"
          className="w-40 h-40 object-cover rounded-full border-4 border-sky-500"
        />
      </div>
      <h1 className="text-5xl font-bold mb-4 select-none">Demiffy!</h1>
      <p className="text-xl text-sky-300 mb-8 px-4 text-center">18-year-old Czech, passionate about IT, military technologies, and aspiring to be an AČR jet pilot.</p>

      <div
        className={`scroll-indicator ${!arrowVisible ? 'hidden' : ''}`}
        onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="arrow">↓</span>
      </div>
    </section>
  );
};

export default MainIntro;
