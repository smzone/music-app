import { useEffect } from 'react';
import usePlayerStore from '../store/usePlayerStore';

// 全局键盘快捷键 — 控制音乐播放器
// Space: 播放/暂停  |  ArrowRight: 下一首  |  ArrowLeft: 上一首
// ArrowUp: 音量+10%  |  ArrowDown: 音量-10%  |  M: 静音切换
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      // 忽略输入框/文本域/contentEditable 中的按键
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      const { showPlayer, togglePlay, nextSong, prevSong, setVolume, volume, toggleMute } = usePlayerStore.getState();
      if (!showPlayer) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSong();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSong();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
