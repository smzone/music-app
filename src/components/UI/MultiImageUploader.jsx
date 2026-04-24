import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Plus, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToBucket, deleteFromBucket, parseStorageUrl, isStorageAvailable } from '../../lib/supabaseService';

// ============================================================================
// MultiImageUploader — 多图上传画廊
//   • 拖拽添加 / 点击添加 / 粘贴图片
//   • 网格预览，支持删除和手动排序（拖拽重排）
//   • 上限控制
// Props:
//   value      string[]  — 图片 URL 数组
//   onChange   (urls)    — 回调
//   bucket     默认 product-images
//   folder     子目录
//   max        最大图片数（默认 8）
//   label      标签
// ============================================================================
export default function MultiImageUploader({
  value = [],
  onChange,
  bucket = 'product-images',
  folder = '',
  max = 8,
  label,
  maxSizeMB = 5,
  disabled = false,
}) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const storageAvailable = isStorageAvailable();

  const urls = Array.isArray(value) ? value : [];

  const uploadFiles = async (files) => {
    const slotsLeft = max - urls.length;
    const toUpload = Array.from(files).slice(0, slotsLeft);
    if (files.length > slotsLeft) {
      toast((t('uploader.maxReached', { max }) || `最多 ${max} 张`));
    }
    if (!toUpload.length) return;

    setUploading(true);
    const next = [...urls];
    for (const file of toUpload) {
      if (!file.type?.startsWith('image/')) continue;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(t('uploader.tooLarge', { max: maxSizeMB }) || `文件过大（${maxSizeMB}MB）`);
        continue;
      }
      if (!storageAvailable) {
        // 降级：DataURL 本地预览
        const dataUrl = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(file);
        });
        next.push(dataUrl);
        continue;
      }
      const { url, error } = await uploadToBucket(bucket, file, folder);
      if (error) {
        toast.error((t('uploader.uploadFailed') || '上传失败') + ': ' + (error.message || ''));
        continue;
      }
      next.push(url);
    }
    setUploading(false);
    onChange?.(next);
    toast.success(t('uploader.uploadOk') || '上传成功');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled || uploading) return;
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const handlePaste = async (e) => {
    if (disabled || uploading) return;
    const files = Array.from(e.clipboardData.items || [])
      .filter((i) => i.type?.startsWith('image/'))
      .map((i) => i.getAsFile())
      .filter(Boolean);
    if (files.length) { e.preventDefault(); uploadFiles(files); }
  };

  const handleRemove = (idx) => {
    const target = urls[idx];
    const parsed = parseStorageUrl(target);
    if (parsed && storageAvailable) {
      deleteFromBucket(parsed.bucket, parsed.path).catch(() => {});
    }
    onChange?.(urls.filter((_, i) => i !== idx));
  };

  // 简易拖拽重排
  const onDragStart = (idx) => setDragIndex(idx);
  const onDragOverItem = (e) => e.preventDefault();
  const onDropItem = (targetIdx) => {
    if (dragIndex === null || dragIndex === targetIdx) return;
    const next = [...urls];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIdx, 0, moved);
    onChange?.(next);
    setDragIndex(null);
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary">{label}</label>
          <span className="text-[10px] text-text-muted">{urls.length} / {max}</span>
        </div>
      )}

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {urls.map((url, idx) => (
          <div
            key={idx}
            draggable={!disabled}
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOverItem}
            onDrop={(e) => { e.stopPropagation(); onDropItem(idx); }}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.02] group cursor-move"
          >
            <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
            {idx === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-black text-[9px] font-bold">{t('uploader.cover') || '封面'}</span>
            )}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                className="w-6 h-6 rounded-full bg-red-500/70 hover:bg-red-500 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
            <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] flex items-center gap-0.5">
                <GripVertical size={8} /> {t('uploader.drag') || '拖拽'}
              </div>
            </div>
          </div>
        ))}

        {/* 添加按钮 */}
        {urls.length < max && (
          <button
            type="button"
            onClick={() => !disabled && !uploading && fileRef.current?.click()}
            disabled={disabled || uploading}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors
              ${disabled ? 'border-white/[0.04] cursor-not-allowed opacity-40' : 'border-white/[0.08] hover:border-primary hover:bg-primary/5 text-text-muted hover:text-primary'}`}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Plus size={18} />
                <span className="text-[10px] font-medium">{t('uploader.add') || '添加'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {!urls.length && (
        <p className="text-[10px] text-text-muted">
          {t('uploader.hintMulti', { max }) || `拖拽或粘贴图片，最多 ${max} 张。第一张为封面图。`}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
