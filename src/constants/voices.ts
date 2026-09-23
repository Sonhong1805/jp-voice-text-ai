export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  badge?: string;
  icon?: string;
  language: string;
}

export const AI_VOICES: VoiceInfo[] = [
  // Tiếng Việt
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ) - Chuẩn', gender: 'Nữ', badge: 'HOT', icon: '👩', language: 'Tiếng Việt' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam) - Trầm ấm', gender: 'Nam', badge: 'HOT', icon: '👨', language: 'Tiếng Việt' },
  // Tiếng Nhật
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (Nữ Nhật) - Phổ thông', gender: 'Nữ', badge: 'HOT', icon: '👩', language: 'Tiếng Nhật' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (Nam Nhật) - Trầm ấm', gender: 'Nam', badge: 'HOT', icon: '👨', language: 'Tiếng Nhật' },
  // Tiếng Anh
  { id: 'en-US-AriaNeural', name: 'Aria (Nữ Mỹ) - Tự nhiên', gender: 'Nữ', badge: 'HOT', icon: '👩', language: 'Tiếng Anh' },
  { id: 'en-US-GuyNeural', name: 'Guy (Nam Mỹ) - Trầm', gender: 'Nam', icon: '👨', language: 'Tiếng Anh' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (Nữ Anh) - Quý tộc', gender: 'Nữ', icon: '👩', language: 'Tiếng Anh' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (Nam Anh) - Chuẩn', gender: 'Nam', icon: '👨', language: 'Tiếng Anh' }
];
