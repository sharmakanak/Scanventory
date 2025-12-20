import { useState } from 'react';
import jsQR from 'jsqr';

/**
 * QRCard Component
 * 
 * Displays a QR code image with hover-to-scan functionality.
 * When user clicks "Scan QR", it decodes the QR code from the image
 * and displays the decoded ID with a copy-to-clipboard button.
 * 
 * @param {string} qrCodeDataUrl - The data URL of the QR code image
 * @param {string} itemId - The item ID (used as fallback/validation)
 * @param {string} size - Size variant: 'small' (h-36 w-36) or 'large' (h-44 w-44)
 */
function QRCard({ qrCodeDataUrl, itemId, size = 'small' }) {
  const qrSize = size === 'large' ? 'h-44 w-44' : 'h-36 w-36';
  const cardTheme = size === 'large' 
    ? 'from-white to-emerald-50 border-emerald-300' 
    : 'from-white to-blue-50 border-blue-200';
  const buttonTheme = size === 'large'
    ? 'text-emerald-600 hover:bg-emerald-50'
    : 'text-blue-600 hover:bg-blue-50';
  const decodedTheme = size === 'large'
    ? 'border-emerald-200'
    : 'border-blue-200';
  const copyButtonTheme = size === 'large'
    ? 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
    : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
  
  const [isHovered, setIsHovered] = useState(false);
  const [decodedId, setDecodedId] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Decode QR code from image data URL
   * Uses jsQR library to decode QR code from canvas image data
   */
  const handleScanQR = async () => {
    if (!qrCodeDataUrl) return;

    setIsDecoding(true);
    setDecodedId(null);

    try {
      // Create an image element from the data URL
      const img = new Image();
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = qrCodeDataUrl;
      });

      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on canvas
      ctx.drawImage(img, 0, 0);

      // Get image data from canvas (RGBA format)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Decode the QR code from the image data using jsQR
      // jsQR expects ImageData with width, height, and data array
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      // Extract the decoded text (item ID)
      if (code && code.data) {
        setDecodedId(code.data);
      } else {
        throw new Error('Could not decode QR code');
      }
    } catch (error) {
      console.error('QR decoding error:', error);
      // If decoding fails, fallback to the itemId prop
      setDecodedId(itemId || 'Decoding failed');
    } finally {
      setIsDecoding(false);
    }
  };

  /**
   * Copy decoded ID to clipboard
   */
  const handleCopyId = async () => {
    if (!decodedId) return;

    try {
      await navigator.clipboard.writeText(decodedId);
      setCopySuccess(true);
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = decodedId;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* QR Code Image Container */}
      <div className={`relative bg-gradient-to-br ${cardTheme} ${size === 'large' ? 'p-5' : 'p-4'} rounded-2xl border-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          className={`${qrSize} rounded-lg pointer-events-none`}
        />

        {/* Hover Overlay with Scan Button */}
        {isHovered && !decodedId && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center transition-opacity duration-300">
            <button
              onClick={handleScanQR}
              disabled={isDecoding}
              className={`bg-white ${buttonTheme} px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDecoding ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Scanning...
                </span>
              ) : (
                '🔍 Scan QR'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Decoded ID Display */}
      {decodedId && (
        <div className={`mt-4 p-4 bg-white rounded-xl border-2 ${decodedTheme} shadow-lg animate-fade-in`}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Decoded Item ID:
              </p>
              <p className="text-sm font-mono font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all">
                {decodedId}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyId}
                className={`flex-1 bg-gradient-to-r ${copyButtonTheme} text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95`}
              >
                {copySuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>📋</span>
                    Copy ID
                  </span>
                )}
              </button>
              <button
                onClick={() => setDecodedId(null)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 border border-slate-300"
                title="Scan again"
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRCard;

