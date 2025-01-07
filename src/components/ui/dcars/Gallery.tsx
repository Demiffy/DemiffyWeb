'use client';

import { useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ReactPlayer from 'react-player';

const images = [
  '/tesla-interior.jpg',
  '/tesla-exterior.jpg',
  '/porsche-interior.jpg',
  '/porsche-exterior.jpg',
];

const videos = [
  'https://www.youtube.com/watch?v=example1',
  'https://www.youtube.com/watch?v=example2',
];

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 p-2 bg-gray-700 rounded-full hover:bg-gray-600 focus:outline-none"
    aria-label="Previous"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 p-2 bg-gray-700 rounded-full hover:bg-gray-600 focus:outline-none"
    aria-label="Next"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('images');

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <section className="py-20 px-4 md:px-0 select-none">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center">Gallery</h2>
        <div className="mb-8 flex justify-center space-x-4">
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === 'images' ? 'bg-white text-black' : 'bg-gray-700'
            }`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === 'videos' ? 'bg-white text-black' : 'bg-gray-700'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
        </div>
        {activeTab === 'images' ? (
          <Slider {...settings}>
            {images.map((image, index) => (
              <div key={index} className="px-2">
                <Image
                  src={image}
                  alt={`Car image ${index + 1}`}
                  width={1200}
                  height={675}
                  className="rounded-lg"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((video, index) => (
              <div key={index} className="aspect-w-16 aspect-h-9">
                <ReactPlayer url={video} width="100%" height="100%" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}