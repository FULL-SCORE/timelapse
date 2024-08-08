'use client'

import { Slider, SliderThumb, SliderTrack, SliderRange } from '@radix-ui/react-slider';
import React, { useEffect, useState } from 'react';

interface ImageData {
    name: string;
    url: string;
}

interface TimeLapseProps {
    date: string;
}

const TimeLapse: React.FC<TimeLapseProps> = ({ date }) => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalTime, setIntervalTime] = useState(1000); // デフォルトは1秒
    const [playing, setPlaying] = useState(true);
    const [speed, setSpeed] = useState<number>(1000); // スピード設定の初期値（1秒）

    useEffect(() => {
        async function fetchImages() {
            const res = await fetch(`/api/getImages?date=${date}`);
            const data = await res.json();
            setImages(data);
        }

        fetchImages();
    }, [date]);

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
        const newSpeed = parseInt(event.target.value, 10);
        setSpeed(newSpeed);
        setIntervalTime(newSpeed);
    };

    const handleIndexChange = (value: number[]) => {
        setCurrentIndex(value[0]);
        setPlaying(false); // スライダーでバーを変更したときは一時停止
    };

    if (images.length === 0) {
        return <p>画像を読み込み中...</p>;
    }

    const { name, url } = images[currentIndex];

    return (
        <div className="p-4">
            <p className="text-lg font-semibold mb-2">{name}</p>
            <img src={url} alt={`Image ${name}`} className="w-full max-w-full mb-4" />

            <div className="mb-4">
                <label htmlFor="speed" className="block text-sm font-medium mb-1">Speed: </label>
                <select
                    id="speed"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="block w-full mb-2 p-2 border border-gray-300 rounded"
                >
                    <option value={100}>0.1秒</option>
                    <option value={300}>0.3秒</option>
                    <option value={400}>0.4秒</option>
                    <option value={500}>0.5秒</option>
                    <option value={1000}>1秒</option>
                    <option value={2000}>2秒</option>
                    {/* 他のオプションを追加することも可能 */}
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="progress" className="block text-sm font-medium mb-1">Progress: </label>
                <Slider
                    id="progress"
                    min={0}
                    max={images.length - 1}
                    step={1}
                    value={[currentIndex]}
                    onValueChange={handleIndexChange}
                    className="relative w-full h-6"
                >
                    <SliderTrack className="absolute w-full h-1 bg-gray-400 rounded-full" />
                    <SliderRange className="absolute h-1 bg-black rounded-full" />
                    <SliderThumb className="w-5 h-5 bg-black rounded-full cursor-pointer" />
                </Slider>
                <span className="text-sm ml-2">{currentIndex + 1} / {images.length}</span>
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

export default TimeLapse;
