import { NextResponse } from 'next/server';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { getUserByUsername, getUserById, updateUser } from '@/lib/db';
import { User } from '@/types/index';

function sanitizeUser(user: User) {
  const { passwordHash, twoFactorSecret, ...sanitized } = user;
  return sanitized;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. LOGIN
    if (action === 'login') {
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Kullanıcı adı ve şifre zorunludur' },
          { status: 400 }
        );
      }

      const user = getUserByUsername(username);
      if (!user) {
        return NextResponse.json(
          { error: 'Kullanıcı adı veya şifre hatalı' },
          { status: 401 }
        );
      }

      // Basit şifre doğrulaması (üretim/demo)
      if (user.passwordHash !== password) {
        return NextResponse.json(
          { error: 'Kullanıcı adı veya şifre hatalı' },
          { status: 401 }
        );
      }

      // 2FA kontrolü
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        return NextResponse.json({
          require2FA: true,
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        });
      }

      // 2FA yoksa doğrudan oturum aç
      return NextResponse.json({
        success: true,
        user: sanitizeUser(user)
      });
    }

    // 2. VERIFY 2FA
    if (action === 'verify-2fa') {
      const { userId, code } = body;
      if (!userId || !code) {
        return NextResponse.json(
          { error: 'Kullanıcı ve 6 haneli kod gereklidir' },
          { status: 400 }
        );
      }

      const user = getUserById(userId);
      if (!user || !user.twoFactorSecret) {
        return NextResponse.json(
          { error: 'Kullanıcı veya 2FA yapılandırması bulunamadı' },
          { status: 404 }
        );
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'OtoServisPro',
        label: user.username,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
      });

      const cleanCode = String(code).replace(/\s+/g, '');
      const delta = totp.validate({ token: cleanCode, window: 1 });

      if (delta === null) {
        return NextResponse.json(
          { error: 'Geçersiz veya süresi dolmuş 2FA kodu. Lütfen Google Authenticator uygulamanızdaki 6 haneli kodu kontrol edin.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        user: sanitizeUser(user)
      });
    }

    // 3. DEMO HELPER: GET CURRENT TOTP FOR EASY TESTING
    if (action === 'get-demo-totp') {
      const { userId } = body;
      const user = getUserById(userId);
      if (!user || !user.twoFactorSecret) {
        return NextResponse.json({ error: '2FA bulunamadı' }, { status: 404 });
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'OtoServisPro',
        label: user.username,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
      });

      return NextResponse.json({
        currentCode: totp.generate(),
        remainingSeconds: 30 - (Math.floor(Date.now() / 1000) % 30)
      });
    }

    // 4. SETUP 2FA (QR CODE & SECRET)
    if (action === 'setup-2fa') {
      const { userId } = body;
      const user = getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }

      const secret = new OTPAuth.Secret({ size: 20 });
      const totp = new OTPAuth.TOTP({
        issuer: 'OtoServisPro',
        label: `${user.username} (${user.fullName})`,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret
      });

      const qrCodeUrl = await QRCode.toDataURL(totp.toString(), {
        width: 260,
        margin: 2,
        color: {
          dark: '#07172c',
          light: '#ffffff'
        }
      });

      return NextResponse.json({
        secret: secret.base32,
        qrCodeUrl,
        uri: totp.toString()
      });
    }

    // 5. CONFIRM 2FA ACTIVATION
    if (action === 'confirm-2fa') {
      const { userId, secret, code } = body;
      if (!userId || !secret || !code) {
        return NextResponse.json(
          { error: 'Kullanıcı, gizli anahtar ve onay kodu zorunludur' },
          { status: 400 }
        );
      }

      const user = getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'OtoServisPro',
        label: user.username,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      const delta = totp.validate({ token: String(code).trim(), window: 1 });
      if (delta === null) {
        return NextResponse.json(
          { error: 'Onay kodu doğrulanamadı. Lütfen Google Authenticator uygulamasındaki kodu tekrar deneyin.' },
          { status: 400 }
        );
      }

      const updated = updateUser(userId, {
        twoFactorEnabled: true,
        twoFactorSecret: secret
      });

      return NextResponse.json({
        success: true,
        message: 'Google Authenticator 2FA başarıyla aktifleştirildi!',
        user: updated ? sanitizeUser(updated) : null
      });
    }

    // 6. DISABLE 2FA
    if (action === 'disable-2fa') {
      const { userId } = body;
      const user = getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }

      const updated = updateUser(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: undefined
      });

      return NextResponse.json({
        success: true,
        message: '2 Adımlı doğrulama devre dışı bırakıldı.',
        user: updated ? sanitizeUser(updated) : null
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Kimlik doğrulama işlemi başarısız' },
      { status: 500 }
    );
  }
}
