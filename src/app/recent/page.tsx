"use client"
import { useEffect, useState } from "react";

interface ImageResponse {
    imageUrl: string;
    filename: string;
    fileList: { name: string }[];
    today: string;
}

export default function Home() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [fileList, setFileList] = useState<{ name: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [today, setToday] = useState<string | null>(null);
    useEffect(() => {
        // API から最新の画像 URL とファイルリストを取得
        const fetchImageUrl = async () => {
            try {
                const response = await fetch(`/api/getnewimage?_=${new Date().getTime()}`, { method: "GET" });


                const data: ImageResponse = await response.json();
                if (data.imageUrl) {
                    setImageUrl(data.imageUrl);
                    setFilename(data.filename);
                    setToday(data.today);
                    // ファイルリストを新しい順にソートし、逆順にする
                    const sortedFileList = data.fileList.sort((a, b) => {
                        const aTimeString = a.name.split('_')[0] + 'T' + a.name.split('_')[1].replace(/-/g, ':');
                        const bTimeString = b.name.split('_')[0] + 'T' + b.name.split('_')[1].replace(/-/g, ':');

                        const aTime = new Date(aTimeString).getTime();
                        const bTime = new Date(bTimeString).getTime();
                        return bTime - aTime;  // bTimeが新しいものが先
                    }).reverse()
                    //.slice(0, 20); // 逆順にする

                    setFileList(sortedFileList);
                    setIsLoading(false);
                } else {
                    setError("画像が見つかりませんでした");
                    setIsLoading(false);
                }
            } catch (err) {
                setError("画像を取得できませんでした");
                console.error(err);
                setIsLoading(false);
            }
        };

        fetchImageUrl();
    }, []);

    return (
        <>
            <div className="container">
                <h1>最新の画像</h1>
                <p>ファイル名: {filename}</p>
                <p>日付: {today}</p>
                {isLoading ? (
                    <p>読み込み中...</p>
                ) : error ? (
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
                        fileList
                            .filter((_, index) => index % 60 === 0) // 30の倍数のインデックスのみ表示
                            .map((file) => (
                                <li key={file.name}>
                                <a href={`https://fs-100.mods.jp/cam/${today}/${file.name}`} target="_blank" rel="noopener noreferrer">
                                    {file.name}
                                </a>
                            </li>
                        ))
                    ) : (
                        <p>ファイルリストを読み込んでいます...</p>
                    )}
                </ul>
            </div>
        </>
    );
}
