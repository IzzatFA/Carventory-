import React, { useState, useEffect } from 'react';

export default function BidTimer({ endTime, onEnd }) {
  const calc = () => {
    const diff = Math.max(0, new Date(endTime) - new Date());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      done: diff === 0,
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => {
      const next = calc();
      setTime(next);
      if (next.done && onEnd) onEnd();
    }, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, '0');
  const urgent = time.h === 0 && time.m < 10;

  return (
    <div className="timer-display">
      {time.h > 0 && (
        <>
          <div className="timer-block">
            <div className="timer-num" style={{ color: urgent ? '#EF4444' : undefined }}>{pad(time.h)}</div>
            <div className="timer-label">Jam</div>
          </div>
          <div className="timer-sep">:</div>
        </>
      )}
      <div className="timer-block">
        <div className="timer-num" style={{ color: urgent ? '#EF4444' : undefined }}>{pad(time.m)}</div>
        <div className="timer-label">Menit</div>
      </div>
      <div className="timer-sep">:</div>
      <div className="timer-block">
        <div className="timer-num" style={{ color: urgent ? '#EF4444' : undefined }}>{pad(time.s)}</div>
        <div className="timer-label">Detik</div>
      </div>
      {time.done && <span className="badge badge-danger">Berakhir</span>}
    </div>
  );
}
