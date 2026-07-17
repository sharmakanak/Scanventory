/* eslint-disable no-empty, react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

/**
 * CameraScanner — live camera QR code reader using @zxing/library.
 * Calls onScan(decodedText) when a QR code is recognised.
 * Calls onClose() when the user stops the camera.
 */
function CameraScanner({ onScan, onClose }) {
    const videoRef       = useRef(null);
    const readerRef      = useRef(null);
    const [error, setError]               = useState('');
    const [scanning, setScanning]         = useState(false);
    const [cameras, setCameras]           = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');

    /* enumerate cameras */
    useEffect(() => {
        const reader = new BrowserQRCodeReader();
        readerRef.current = reader;

        reader.listVideoInputDevices()
            .then((devices) => {
                setCameras(devices);
                if (devices.length > 0) setSelectedCamera(devices[0].deviceId);
                else setError('No camera found on this device.');
            })
            .catch(() => setError('Unable to access camera. Please allow camera permissions.'));

        return () => {
            try { reader.stopContinuousDecode(); } catch {}
            try { reader.reset(); } catch {}
        };
    }, []);

    /* start scanning when camera selected */
    useEffect(() => {
        const reader = readerRef.current;
        if (!reader || !selectedCamera || !videoRef.current) return;

        setScanning(true);
        setError('');
        try { reader.stopContinuousDecode(); } catch {}

        reader.decodeFromVideoDevice(selectedCamera, videoRef.current, (result, err) => {
            if (result) {
                const text = result.getText();
                try { reader.stopContinuousDecode(); } catch {}
                setScanning(false);
                onScan(text);
            }
            if (err && err.name && err.name !== 'NotFoundException') {
                console.warn('QR scan frame error:', err.message);
            }
        }).catch((err) => {
            setError('Camera error: ' + (err.message || 'Could not start camera.'));
            setScanning(false);
        });
    }, [selectedCamera, onScan]);

    const handleStop = () => {
        const reader = readerRef.current;
        if (reader) {
            try { reader.stopContinuousDecode(); } catch {}
            try { reader.reset(); } catch {}
        }
        onClose();
    };

    const handleCameraChange = (deviceId) => {
        const reader = readerRef.current;
        if (reader) try { reader.stopContinuousDecode(); } catch {}
        setSelectedCamera(deviceId);
    };

    return (
        <div className="animate-slide-up space-y-3">
            {/* Camera selector */}
            {cameras.length > 1 && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Select Camera
                    </label>
                    <select
                        value={selectedCamera}
                        onChange={(e) => handleCameraChange(e.target.value)}
                        className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-700 px-3 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 transition-all"
                    >
                        {cameras.map((cam) => (
                            <option key={cam.deviceId} value={cam.deviceId}>
                                {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Error state */}
            {error ? (
                <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/30 px-4 py-4 text-sm text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {error}
                </div>
            ) : (
                <div className="scanner-box w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-emerald-500/30">
                    <video
                        ref={videoRef}
                        className="w-full rounded-2xl"
                        playsInline
                        muted
                        style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                    />
                    {scanning && <div className="scan-line" />}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    {scanning ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Point camera at a QR code…
                        </>
                    ) : error ? '' : (
                        <>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Starting camera…
                        </>
                    )}
                </p>
                <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Close
                </button>
            </div>
        </div>
    );
}

export default CameraScanner;
