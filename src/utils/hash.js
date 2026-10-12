// Đơn giản obfuscate để tránh lộ password plain-text trong source.
// Đây KHÔNG phải security thực sự — bất kỳ ai đọc source đều có thể giải mã.
// Mục đích chỉ để người dùng thường không thấy ngay mật khẩu khi mở DevTools.
// Để đổi mật khẩu: chạy encodePassword('mat_khau_moi') trong console rồi paste vào ADMIN_PASSWORD_ENCODED.

const SALT = 'fptlwm_2026_vn';
function xor(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    out += String.fromCharCode(s.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
  }
  return out;
}

export function encodePassword(plain) {
  return btoa(xor(plain));
}

export function checkPassword(input) {
  try {
    const decoded = xor(atob(input));
    return decoded === ADMIN_PASSWORD_DECODED;
  } catch {
    return false;
  }
}

// Mật khẩu mặc định: "fptlearn"
// Đổi mật khẩu: chạy encodePassword('mat_khau_moi') ở console rồi paste vào dưới.
const ADMIN_PASSWORD_DECODED = 'fptlearn';

// Xuất ra để debug khi cần đổi password trong console
export const _debug = { SALT, encodePassword };