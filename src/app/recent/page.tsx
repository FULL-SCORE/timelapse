"use client"
import { useEffect, useState } from "react";

interface ImageResponse {
    imageUrl: string;
    filename: string;
    fileList: { name: string }[];
}

export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [fileList, setFileList] = useState<{ name: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // API から最新の画像 URL とファイルリストを取得
        const fetchImageUrl = async () => {
            try {
                const response = await fetch(`/api/getnewimage?_=${new Date().getTime()}`, { method: "GET" });


                const data: ImageResponse = await response.json();
                if (data.imageUrl) {
                    setImageUrl(data.imageUrl);
                    setFilename(data.filename);
                    
                    // ファイルリストを新しい順にソートし、逆順にする
                    const sortedFileList = data.fileList.sort((a, b) => {
                        const aTimeString = a.name.split('_')[0] + 'T' + a.name.split('_')[1].replace(/-/g, ':');
                        const bTimeString = b.name.split('_')[0] + 'T' + b.name.split('_')[1].replace(/-/g, ':');

                        const aTime = new Date(aTimeString).getTime();
                        const bTime = new Date(bTimeString).getTime();
                        return bTime - aTime;  // bTimeが新しいものが先
                    }).reverse(); // 逆順にする

                    setFileList(sortedFileList);
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
        <>
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
        
        <div>
            <h1>ファイル一覧</h1>
            <ul>
                {fileList.length > 0 ? (
                    fileList.map((file) => (
                        <li key={file.name}>{file.name}</li>
                    ))
                ) : (
                    <p>ファイルリストを読み込んでいます...</p>
                )}
            </ul>
        </div>
        </>
    );
}
