import { create } from 'zustand';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchTasks as fetchTasksApi,
  createTask as createTaskApi,
  applyForTask as applyForTaskApi,
} from '../lib/supabaseService';

// 任务大厅状态管理（支持 Supabase / 本地双模式）
const useTaskStore = create((set, get) => ({
  // 任务列表
  tasks: [],
  // 总数（分页用）
  totalCount: 0,
  // 加载状态
  tasksLoading: false,
  // 当前筛选条件
  category: 'all',
  search: '',
  page: 1,

  // ========== 加载任务列表 ==========
  loadTasks: async ({ category = 'all', search = '', page = 1 } = {}) => {
    if (!isSupabaseConfigured) return;
    set({ tasksLoading: true, category, search, page });
    const { data, count } = await fetchTasksApi({ category, search, page });
    set({
      tasks: page === 1 ? data : [...get().tasks, ...data],
      totalCount: count,
      tasksLoading: false,
    });
  },

  // 加载更多
  loadMore: async () => {
    const { category, search, page } = get();
    await get().loadTasks({ category, search, page: page + 1 });
  },

  // ========== 创建任务 ==========
  createTask: async (taskData, user) => {
    if (!isSupabaseConfigured) {
      // 本地 fallback：直接添加到列表头部
      const localTask = {
        id: Date.now(),
        ...taskData,
        creator_id: user?.id,
        profiles: { username: user?.username, avatar_url: null },
        status: 'open',
        applicant_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        is_hot: false,
      };
      set((state) => ({ tasks: [localTask, ...state.tasks] }));
      return { data: localTask, error: null };
    }
    const { data, error } = await createTaskApi({
      ...taskData,
      creator_id: user?.id,
    });
    if (!error && data) {
      set((state) => ({ tasks: [data, ...state.tasks] }));
    }
    return { data, error };
  },

  // ========== 申请任务 ==========
  applyTask: async (taskId, userId, message = '') => {
    if (!isSupabaseConfigured) {
      // 本地 fallback：乐观更新申请数
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, applicants: (t.applicants || 0) + 1, applicant_count: (t.applicant_count || 0) + 1 }
            : t
        ),
      }));
      return { error: null };
    }
    const { error } = await applyForTaskApi(taskId, userId, message);
    if (!error) {
      // 乐观更新申请数
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, applicant_count: (t.applicant_count || 0) + 1 }
            : t
        ),
      }));
    }
    return { error };
  },
}));

export default useTaskStore;
