import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Loader2, ImageIcon, Link2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToBucket, deleteFromBucket, parseStorageUrl, isStorageAvailable } from '../../lib/supabaseService';

// ============================================================================
// ImageUploader — 单图上传组件
//   • 拖拽 / 点击选择 / 粘贴 URL
//   • 自动上传到 Supabase Storage（可降级：仅用 URL）
//   • 预览 / 删除
// Props:
//   value         当前图片 URL
//   onChange(url) 图片变更回调
//   bucket        存储桶名（默认 product-images）
//   folder        子目录（如 userId / productId）
//   label         标签文本
//   maxSizeMB     最大文件大小（默认 5）
//   aspect        预览宽高比（方形 'square' | 'video' | 'wide'）
// ============================================================================
export default function ImageUploader({
  value = '',
  onChange,
  bucket = 'product-images',
  folder = '',
  label,
  maxSizeMB = 5,
  aspect = 'square',
  disabled = false,
}) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlMode, setShowUrlMode] = useState(false);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
  }[aspect] || 'aspect-square';

  const storageAvailable = isStorageAvailable();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast.error(t('uploader.notImage') || '只允许上传图片');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(t('uploader.tooLarge', { max: maxSizeMB }) || `文件过大（限制 ${maxSizeMB}MB）`);
      return;
    }

    // 若未配置 Supabase，降级为 DataURL 本地预览
    if (!storageAvailable) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange?.(reader.result);
        toast(t('uploader.localOnly') || '未配置 Supabase，仅本地预览');
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    setProgress(0);
    const { url, error } = await uploadToBucket(bucket, file, folder, setProgress);
    setUploading(false);
    if (error) {
      toast.error((t('uploader.uploadFailed') || '上传失败') + ': ' + (error.message || ''));
      return;
    }
    onChange?.(url);
    toast.success(t('uploader.uploadOk') || '上传成功');
  }, [bucket, folder, maxSizeMB, onChange, storageAvailable, t]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePaste = async (e) => {
    if (disabled || uploading) return;
    const item = Array.from(e.clipboardData.items || []).find((i) => i.type?.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) handleFile(file);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    const parsed = parseStorageUrl(value);
    if (parsed && storageAvailable) {
      // 后台删除，不阻塞 UI
      deleteFromBucket(parsed.bucket, parsed.path).catch(() => {});
    }
    onChange?.('');
  };

  const handleUrlSubmit = () => {
    const v = urlInput.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v) && !v.startsWith('data:')) {
      toast.error(t('uploader.invalidUrl') || 'URL 格式错误');
      return;
    }
    onChange?.(v);
    setUrlInput('');
    setShowUrlMode(false);
    toast.success(t('uploader.urlOk') || '图片已设置');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold block text-text-secondary">
          {label}
        </label>
      )}

      {/* 已有图片 — 预览 */}
      {value ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] group`}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          )}
          {!disabled && !uploading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm"
              >
                <Upload size={12} /> {t('uploader.replace') || '替换'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-full bg-red-500/70 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm"
              >
                <X size={12} /> {t('uploader.remove') || '移除'}
              </button>
            </div>
          )}
        </div>
      ) : showUrlMode ? (
        /* URL 输入模式 */
        <div className={`${aspectClass} rounded-xl border border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center p-4 gap-2`}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            placeholder="https://..."
            className="w-full max-w-sm px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleUrlSubmit} className="px-3 py-1.5 rounded-full bg-primary text-black text-xs font-bold flex items-center gap-1">
              <Check size={12} /> {t('uploader.confirm') || '确认'}
            </button>
            <button type="button" onClick={() => { setShowUrlMode(false); setUrlInput(''); }} className="px-3 py-1.5 rounded-full text-text-muted hover:text-white text-xs">
              {t('uploader.cancel') || '取消'}
            </button>
          </div>
        </div>
      ) : (
        /* 空状态 — 拖拽区 */
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => !disabled && !uploading && fileRef.current?.click()}
          className={`${aspectClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
            ${disabled ? 'border-white/[0.04] bg-white/[0.01] cursor-not-allowed opacity-50'
              : dragOver
                ? 'border-primary bg-primary/10'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]'}`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-primary" />
              <span className="text-xs text-text-muted">
                {t('uploader.uploading') || '上传中...'} {Math.floor(progress * 100)}%
              </span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
                {dragOver ? <Upload size={20} className="text-primary" /> : <ImageIcon size={20} className="text-text-muted" />}
              </div>
              <div className="text-xs text-text-secondary font-medium">
                {dragOver
                  ? (t('uploader.dropHere') || '松开以上传')
                  : (t('uploader.clickOrDrag') || '点击/拖拽/粘贴图片到此处')}
              </div>
              <div className="text-[10px] text-text-muted">
                {storageAvailable
                  ? `${t('uploader.maxSize') || '最大'} ${maxSizeMB}MB · JPG/PNG/WebP`
                  : (t('uploader.localOnlyHint') || '未配置 Supabase，仅本地预览')}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowUrlMode(true); }}
                className="text-[10px] text-primary hover:text-primary-hover flex items-center gap-0.5 mt-1"
              >
                <Link2 size={10} /> {t('uploader.pasteUrl') || '或粘贴图片链接'}
              </button>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
