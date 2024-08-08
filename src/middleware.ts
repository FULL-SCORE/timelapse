import { NextResponse, NextRequest } from 'next/server';

const USERNAME = process.env.BASIC_AUTH_USERNAME || 'default-username';
const PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'default-password';

export function middleware(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');

    if (authHeader) {
        const [scheme, encoded] = authHeader.split(' ');

        if (scheme === 'Basic' && encoded) {
            const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');

            if (user === USERNAME && pass === PASSWORD) {
                return NextResponse.next();
            }
        }
    }

    const response = new NextResponse('Authentication required', { status: 401 });
    response.headers.set('WWW-Authenticate', 'Basic realm="Secure Area"');
    return response;
}

export const config = {
    matcher: ['/((?!api|static|favicon.ico).*)'], // ミドルウェアを適用するパスのパターン
};
