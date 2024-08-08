'use client';

import React, { useEffect, useState } from 'react';

interface ImageData {
    name: string;
    url: string;
}

// TimeLapseComponent の型を定義
interface TimeLapseComponentProps {
    date: string;
}

const TimeLapseComponent: React.FC<TimeLapseComponentProps> = ({ date }) => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalTime, setIntervalTime] = useState(100); // デフォルトは0.1秒
    const [playing, setPlaying] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(date); // デフォルトは props の date
    const [loading, setLoading] = useState<boolean>(true); // ローディング状態
    const [error, setError] = useState<string | null>(null); // エラー状態

    useEffect(() => {
        async function fetchImages() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/getImages?date=${selectedDate}`);
                if (!res.ok) throw new Error('データの取得に失敗しました');
                const data = await res.json();
                setImages(data);
                setCurrentIndex(0); // データ取得後にインデックスをリセット
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchImages();
    }, [selectedDate]);

    useEffect(() => {
        if (images.length === 0) return;

        let interval: NodeJS.Timeout;

        if (playing) {
            interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, intervalTime);
        }

        return () => clearInterval(interval);
    }, [images, playing, intervalTime]);

    const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        switch (value) {
            case '0.1':
                setIntervalTime(100); // 0.1秒
                break;
            case '0.5':
                setIntervalTime(500); // 0.5秒
                break;
            case '1':
                setIntervalTime(1000); // 1秒
                break;
            default:
                setIntervalTime(100); // デフォルト値
                break;
        }
    };

    const handleIndexChange = (amount: number) => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + amount;
            if (newIndex >= images.length) return 0;
            if (newIndex < 0) return images.length - 1;
            return newIndex;
        });
        setPlaying(false); // ボタンでバーを変更したときは一時停止
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    if (loading) {
        return <p>画像を読み込み中...</p>;
    }

    if (error) {
        return <p>エラーが発生しました: {error}</p>;
    }

    if (images.length === 0) {
        return <p>画像が見つかりません</p>;
    }

    // currentIndex が images 配列の範囲内であることを確認
    const image = images[currentIndex] || { name: 'N/A', url: '' };
    const { name, url } = image;

    return (
        <div className="p-4">
            <p className="text-lg font-semibold mb-2">{name}</p>
            <img src={url} alt={`Image ${name}`} className="w-full max-w-full mb-4" />

            <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium mb-1">Select Date: </label>
                <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="py-2 px-4 border border-gray-300 rounded"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="speed" className="block text-sm font-medium mb-1">Speed: </label>
                <select
                    id="speed"
                    onChange={handleSpeedChange}
                    className="py-2 px-4 border border-gray-300 rounded"
                >
                    <option value="0.1">0.1秒 (標準)</option>
                    <option value="0.5">0.5秒</option>
                    <option value="1">1秒</option>
                </select>
            </div>

            <div className="mb-4">
                <button
                    onClick={() => handleIndexChange(-1)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                    Previous
                </button>
                <button
                    onClick={() => handleIndexChange(-10)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                    -10
                </button>
                <button
                    onClick={() => handleIndexChange(-100)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                    -100
                </button>
                <button
                    onClick={() => handleIndexChange(10)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                    +10
                </button>
                <button
                    onClick={() => handleIndexChange(100)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                    +100
                </button>
                <button
                    onClick={() => handleIndexChange(1)}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Next
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm">
                    {currentIndex + 1} / {images.length}
                </p>
            </div>

            <button
                onClick={() => setPlaying((prev) => !prev)}
                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {playing ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

export default TimeLapseComponent;
