import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';

// 默认页面区块
const defaultSections = [
  { id: 'hero', name: 'Hero 横幅', description: '首页顶部大图 + 标语', visible: true },
  { id: 'stats', name: '数据统计', description: '歌曲数/播放量/评分/粉丝', visible: true },
  { id: 'about', name: '关于我', description: '个人简介 + 配图', visible: true },
  { id: 'music', name: '精选歌曲', description: '歌曲卡片网格展示', visible: true },
  { id: 'contact', name: '联系方式', description: '邮件 + 社交媒体链接', visible: true },
  { id: 'footer', name: '页脚', description: '版权信息', visible: true },
];

// 可拖拽的区块项
function SortableItem({ section, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDragging ? 'bg-surface-lighter border-primary shadow-lg' : 'bg-surface-light border-surface-lighter hover:border-primary/30'}`}>
      {/* 拖拽手柄 */}
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-text-muted hover:text-white p-1">
        <GripVertical size={20} />
      </button>

      {/* 区块信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-[15px] font-semibold ${section.visible ? 'text-white' : 'text-text-muted line-through'}`}>
            {section.name}
          </h3>
          {!section.visible && <span className="text-xs bg-surface-lighter text-text-muted px-2 py-0.5 rounded-full">已隐藏</span>}
        </div>
        <p className="text-sm text-text-muted mt-0.5">{section.description}</p>
      </div>

      {/* 显示/隐藏 */}
      <button onClick={() => onToggle(section.id)}
        className={`p-2 rounded-lg transition-colors ${section.visible ? 'text-primary hover:bg-primary/10' : 'text-text-muted hover:bg-surface-lighter'}`}>
        {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}

export default function SectionsPage() {
  const [sections, setSections] = useState(defaultSections);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const toggleVisibility = (id) => {
    setSections((items) => items.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleSave = () => {
    // 接入 Supabase 后保存排序到数据库
    toast.success('页面排序已保存');
  };

  return (
    <div className="animate-fadeIn max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">页面区块排序</h1>
          <p className="text-sm text-text-muted mt-1">拖拽调整首页各区块的展示顺序，点击眼睛图标显示/隐藏区块</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all">
          <Save size={18} /> 保存排序
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableItem key={section.id} section={section} onToggle={toggleVisibility} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 预览提示 */}
      <div className="mt-8 bg-surface-light/50 rounded-xl p-5 border border-surface-lighter">
        <h3 className="text-sm font-semibold text-white mb-2">💡 使用说明</h3>
        <ul className="space-y-1 text-sm text-text-muted">
          <li>• 拖拽左侧抓手图标可调整区块顺序</li>
          <li>• 点击右侧眼睛图标可显示/隐藏区块</li>
          <li>• 修改后点击「保存排序」生效</li>
          <li>• 接入 Supabase 后排序会持久化保存</li>
        </ul>
      </div>
    </div>
  );
}
