import React, { useState, useEffect, useRef } from 'react';

const OpeningAnimation = ({ onComplete, currentUser }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const shouldShow = checkShouldShowAnimation();
    if (shouldShow) {
      setShowAnimation(true);
    } else {
      onComplete();
    }
  }, [currentUser, onComplete]);

  const checkShouldShowAnimation = () => {
    console.log("Debug: checkShouldShowAnimation called, currentUser:", currentUser);
    // Only show if user is NOT logged in
    return !currentUser;
    return true;
  };

  const handleVideoEnd = () => {
    setTimeout(() => {
      setShowAnimation(false);
      onComplete();
    }, 500);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowAnimation(false);
    onComplete();
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = (e) => {
    console.warn('Video failed to load:', e);
    handleSkip();
  };

  if (!showAnimation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm"
      >
        Skip
      </button>

      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm opacity-75">Loading...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        style={{ 
          opacity: isVideoLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        <source src="/Adding_Text_and_Trophy_to_Video.mp4" type="video/mp4" />
        <div className="text-white text-center p-8">
          <p>Your browser doesn't support video playback.</p>
          <button 
            onClick={handleSkip}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue to App
          </button>
        </div>
      </video>
    </div>
  );
};

export default OpeningAnimation;
