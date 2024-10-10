import { NextRequest, NextResponse } from "next/server";

import { Client } from 'basic-ftp'; // 正しいインポート
import { format } from "date-fns";

export const runtime = 'edge';



export async function GET(req: NextRequest) {
    // console.log("getnewimage");
    const client = new Client();
    client.ftp.verbose = true;

    const today = format(new Date(), "yyyy-MM-dd");
    // console.log(today);


    try {
        // FTPサーバーにアクセス
        await client.access({
            host: process.env.FTP_HOST || "ftp.example.com",
            user: process.env.FTP_USER || "username",
            password: process.env.FTP_PASSWORD || "password",
        });

        // 今日の日付フォルダに移動
        await client.cd(`cam/${today}`);

        // フォルダ内のすべてのファイルをリスト化
        const fileList = await client.list();

        // console.log(fileList);

        // jpg ファイルをフィルタリングして最新のファイルを取得
        const jpgFiles = fileList.filter(file => file.name.endsWith(".jpg"));

        // 名前でファイルをソートし、最新のファイルを取得
        const latestFile = jpgFiles.sort((a, b) => {
            const aTime = new Date(a.name.split('_')[1].replace(/-/g, ':')).getTime();
            const bTime = new Date(b.name.split('_')[1].replace(/-/g, ':')).getTime();
            return aTime - bTime;  // 新しいものが先
        })[jpgFiles.length - 1];  // 最後のファイル

        if (latestFile) {
            // FTP サーバーの画像 URL を生成
            const imageUrl = `${process.env.FTP_BASE_URL || 'http://example.com/'}cam/${today}/${latestFile.name}?_=${new Date().getTime()}`;
            const filename = latestFile.name;
            return NextResponse.json({ imageUrl, filename, fileList }, { status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                    'CDN-Cache-Control': 'no-store',
                    'Vercel-CDN-Cache-Control': 'no-store'
                  }
            });
        } else {
            return NextResponse.json({ error: "画像が見つかりませんでした" }, { status: 404 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "FTP接続に失敗しました" }, { status: 500 });
    } finally {
        client.close();
    }
}
