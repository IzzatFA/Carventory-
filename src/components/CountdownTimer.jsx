import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Fungsi untuk menghitung selisih waktu
        const calculateTime = () => {
            // Pastikan format string tanggal dari backend bisa dibaca new Date()
            const difference = new Date(endTime).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                // Kalau waktu habis, set ke 0 semua
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        // Panggil sekali saat pertama kali di-render biar nggak ada delay 1 detik
        calculateTime();

        // Set interval setiap 1000ms (1 detik)
        const timerId = setInterval(calculateTime, 1000);

        // Cleanup function: wajib ada biar memori browser nggak bocor waktu pindah halaman
        return () => clearInterval(timerId);
    }, [endTime]);

    // Helper buat nambahin angka '0' di depan angka tunggal (ex: 9 jadi 09)
    const formatNum = (num) => String(num).padStart(2, '0');

    return (
        <div className="timer-container">
            <div className="timer-box">
                <span className="timer-num">{formatNum(timeLeft.hours)}</span>
                <span className="timer-unit">Jam</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-box">
                <span className="timer-num">{formatNum(timeLeft.minutes)}</span>
                <span className="timer-unit">Menit</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-box">
                <span className="timer-num">{formatNum(timeLeft.seconds)}</span>
                <span className="timer-unit">Detik</span>
            </div>
        </div>
    );
}