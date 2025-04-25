// ui/Maintenance.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const Maintenance: React.FC = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary-color text-white">
    <Helmet>
      <title>Site Under Maintenance</title>
      <meta name="robots" content="noindex" />
    </Helmet>

    <h1 className="mb-4 text-4xl font-extrabold tracking-wide uppercase">
      Soon back!
    </h1>
    <p className="max-w-md text-center text-lg leading-relaxed">
      Site is currently undergoing maintenance<br />
      Thank you for your understanding
    </p>
  </div>
);

export default Maintenance;
