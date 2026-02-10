import React from 'react';

export const PageIllustration: React.FC = () => {
  return (
    <>
      {/* Mobile Background */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50">
        <div className="absolute inset-0 bg-white/80"></div>
        {/* Decorative elements for mobile */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-green-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-purple-200/20 rounded-full blur-xl"></div>
      </div>
      
      {/* Desktop Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center ">
          <img 
            src="./1.png"
            alt="AI Bot with person"
            className="w-full h-full object-cover shadow-2xl"
          />
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-blue-200/40 rounded-full blur-2xl"></div>
      </div>
    </>
  );
};
