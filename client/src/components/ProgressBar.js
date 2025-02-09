import { useState } from 'react';

const ProgressBar = () => {
  const [progress, setProgress] = useState(78);

  const handleInputChange = (e) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    setProgress(value);
  };

  const progressStyle = {
    '--progress-value': progress,
    '--progress-indicator-size': '350px',
    '--progress-size': '190px',
    '--progress-inner-size': 'calc(var(--progress-size) - 20px)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--progress-size)',
    height: 'var(--progress-size)',
    borderRadius: '50%',
    border: '5px solid hsl(5, 100%, 70%)',
    background: '#gray',
  };

  const progressInnerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--progress-inner-size)',
    height: 'var(--progress-inner-size)',
    borderRadius: '50%',
    background: '#gray',
    margin: 'auto',
    overflow: 'hidden',
  };

  const indicatorStyle = {
    position: 'absolute',
    top: `calc(100% - ${progress}%)`,
    left: '-50%',
    right: '50%',
    width: 'var(--progress-indicator-size)',
    height: 'var(--progress-indicator-size)',
    borderRadius: 'calc(var(--progress-indicator-size) / 2.5)',
    background: 'hsl(5, 100%, 50%)',
    transformOrigin: 'center center',
    opacity: 0.6,
    animation: 'progress-wave-animation 8s linear infinite both',
  };

  const indicator2Style = {
    ...indicatorStyle,
    background: 'hsl(5, 100%, 70%)',
    transform: 'rotate(90deg)',
    borderRadius: '90%',
  };

  const labelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    height: '90%',
    color: progress > 50 ? '#f5f5f5' : '#000',
    textAlign: 'center',
    overflow: 'hidden',
  };

  const fireworkAnimation = progress === 100 ? {
    animation: 'progress-firework 1.3s 0.1s ease infinite both',
    '--color-progress': '#557c55',
    '--color-progress-alpha': '#a6cf98',
  } : {};

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        role="progressbar"
        style={{...progressStyle, ...fireworkAnimation}}
        data-value={progress}
        className='items-center'
      >
        <div style={progressInnerStyle}>
          <div style={indicatorStyle} />
          <div style={indicator2Style} />
        </div>
        <span className='items-center' style={labelStyle}>
          <span className="text-2xl items-center">{progress}</span>
          <span className="text-2xl">%</span>
        </span>
      </div>


      <style jsx global>{`
        @keyframes progress-firework {
          from {
            width: 50%;
            height: 50%;
            background: var(--color-progress, hsl(5, 100%, 50%));
            opacity: 1;
          }
          30% {
            opacity: 1;
          }
          to {
            width: 150%;
            height: 150%;
            background: var(--color-progress-alpha, hsl(5, 100%, 70%));
            opacity: 0;
          }
        }

        @keyframes progress-wave-animation {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;