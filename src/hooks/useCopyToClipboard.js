import { useState, useCallback } from 'react';

// useCopyToClipboard — 复制文本到剪贴板，返回复制状态
// 用法: const [copied, copy] = useCopyToClipboard();
//       <button onClick={() => copy('hello')}>{ copied ? '已复制' : '复制' }</button>
export default function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch {
      // 降级方案：textarea + execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        return false;
      }
    }
  }, [resetDelay]);

  return [copied, copy];
}
