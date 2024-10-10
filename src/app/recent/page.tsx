"use client"
import { useEffect, useState } from "react";

interface ImageResponse {
    imageUrl: string;
    filename: string;
}

export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // API から最新の画像 URL を取得
        const fetchImageUrl = async () => {
            try {
                // console.log("fetchImageUrl");
                const response = await fetch("/api/getnewimage", { method: "GET" });

                const data: ImageResponse = await response.json();
                // console.log(data);
                if (data.imageUrl) {
                    setImageUrl(data.imageUrl);
                    setFilename(data.filename);
                } else {
                    setError("画像が見つかりませんでした");
                }
            } catch (err) {
                setError("画像を取得できませんでした");
                console.error(err);
            }
        };

        fetchImageUrl();
    }, []);

    return (
        <div className="container">
            <h1>最新の画像</h1>
            <p>ファイル名: {filename}</p>
            {error ? (
                <p>{error}</p>
            ) : imageUrl ? (
                <img src={imageUrl} alt="最新の画像" />
            ) : (
                <p>画像を読み込んでいます...</p>
            )}
        </div>
    );
}
