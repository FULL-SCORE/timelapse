import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'basic-ftp'; // 正しいインポート

async function getImagesFromFTP(date: string) {
    const client = new Client(); // `Client` を正しく使用
    client.ftp.verbose = true;

    try {
        await client.access({
            host: process.env.FTP_HOST || "ftp.example.com",
            user: process.env.FTP_USER || "username",
            password: process.env.FTP_PASSWORD || "password",
            secure: false
        });

        const dirPath = `/cam/${date}/`;
        await client.cd(dirPath);

        const imageList = await client.list();
        const imageData = imageList.map(file => ({
            name: file.name,
            url: `${process.env.FTP_BASE_URL || 'http://example.com/cam'}${dirPath}${file.name}`
        }));

        return imageData;


    } catch (err) {
        console.error(err);
        return [];
    } finally {
        client.close();
    }
}

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const images = await getImagesFromFTP(date);
    return NextResponse.json(images, { status: 200 });
}
