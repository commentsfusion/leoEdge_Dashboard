'use client';
import React from 'react';
import {useRouter} from 'next/navigation';
import {FiFrown} from 'react-icons/fi';

// JSON-like content
const content = {
  code: '404',
  title: 'Oops! Page Not Found',
  description: "The page you're looking for might have been moved, deleted, or doesn't exist. Let's get you back on track!",
  backButton: 'Go Back',
  homeButton: 'Return To Home',
};

export default function NotFoundPage () {
  const router = useRouter ();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center ">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-primary">
            {content.code}
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black mt-4 mb-6">
            {content.title}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-8 max-w-md mx-auto">
            {content.description}
          </p>
          <div className="flex flex-col md:flex-row gap-4 w-full sm:w-full justify-center">
            <button onClick={() => router.push ('/')} className="btn-primary">
              {content.homeButton}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
