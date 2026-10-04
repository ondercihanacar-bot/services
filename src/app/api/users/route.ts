import { NextResponse } from 'next/server';
import { getUsers, getUserById, getUserByUsername, createUser, updateUser, deleteUser } from '@/lib/db';
import { User, AppMenuItem, UserRole } from '@/types/index';

function sanitizeUser(user: User) {
  const { passwordHash, twoFactorSecret, ...sanitized } = user;
  return {
    ...sanitized,
    hasTwoFactorSecret: Boolean(twoFactorSecret)
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId') || undefined;

    const users = getUsers(shopId);
    return NextResponse.json(users.map(sanitizeUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      shopId,
      username,
      fullName,
      role = 'USER',
      password,
      allowedMenus,
      phone,
      email,
      twoFactorEnabled = false
    } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { error: 'Kullanıcı adı, isim ve şifre zorunludur' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = getUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { error: `"${cleanUsername}" kullanıcı adı zaten kullanılıyor` },
        { status: 409 }
      );
    }

    // Varsayılan menü izinleri
    const defaultMenus: AppMenuItem[] = role === 'ADMIN'
      ? ['dashboard', 'orders', 'inventory', 'vehicles', 'accounts', 'reminders', 'reports', 'settings']
      : (Array.isArray(allowedMenus) && allowedMenus.length > 0
          ? allowedMenus
          : ['dashboard', 'orders', 'vehicles']);

    const newUser = createUser(shopId || 'shop-1', {
      username: cleanUsername,
      fullName: fullName.trim(),
      role: role as UserRole,
      passwordHash: password,
      allowedMenus: defaultMenus,
      phone: phone || '',
      email: email || '',
      twoFactorEnabled: Boolean(twoFactorEnabled),
      twoFactorSecret: twoFactorEnabled ? 'JBSWY3DPEHPK3PXP' : undefined
    });

    return NextResponse.json(sanitizeUser(newUser), { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error?.message || 'Kullanıcı oluşturulamadı' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, password, allowedMenus, fullName, phone, email, role, twoFactorEnabled } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID zorunludur' }, { status: 400 });
    }

    const updates: Partial<User> = {};

    if (password && typeof password === 'string' && password.trim()) {
      updates.passwordHash = password.trim();
    }

    if (Array.isArray(allowedMenus)) {
      updates.allowedMenus = allowedMenus;
    }

    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email !== undefined) updates.email = email.trim();
    if (role !== undefined) updates.role = role;
    if (twoFactorEnabled !== undefined) {
      updates.twoFactorEnabled = Boolean(twoFactorEnabled);
      if (!updates.twoFactorEnabled) {
        updates.twoFactorSecret = undefined;
      }
    }

    const updated = updateUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(sanitizeUser(updated));
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error?.message || 'Kullanıcı güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const target = getUserById(id);
    if (!target) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (target.username === 'admin') {
      return NextResponse.json({ error: 'Ana yönetici (admin) hesabı silinemez' }, { status: 403 });
    }

    const success = deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Kullanıcı başarıyla silindi' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error?.message || 'Kullanıcı silinemedi' }, { status: 500 });
  }
}
