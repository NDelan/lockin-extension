import React from 'react';

const PopoutButton = () => {
  const handlePopout = () => {
    // Create a new window with the extension content
    const popoutURL = chrome.runtime.getURL('popup/index.html?popout=true');
    chrome.windows.create({
      url: popoutURL,
      type: 'popup',
      width: 1024,
      height: 768
    });
  };

  return (
    <button
      className="popout-button"
      onClick={handlePopout}
      title="Open in larger window"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3h6v6"></path>
        <path d="M10 14L21 3"></path>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      </svg>
    </button>
  );
};

export default PopoutButton;