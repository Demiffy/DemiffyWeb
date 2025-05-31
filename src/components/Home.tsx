// Home.tsx
import { Helmet } from 'react-helmet-async';

const Home = () => {
  return (
    <div className="min-h-screen text-white bg-primary-color flex flex-col items-center justify-center">
      <Helmet>
        <title>Home – Demiffy</title>
        <meta
          name="description"
          content="Welcome"
        />
        <link rel="canonical" href="https://demiffy.com" />
      </Helmet>

      <h1 className="text-4xl font-bold mb-4">Welcome to Demiffy.com</h1>
      <p className="text-lg text-center">Homepage under construction.</p>
    </div>
  );
};

export default Home;