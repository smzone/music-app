import { useEffect, useState, useMemo } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchProducts,
  fetchProductById,
  fetchProductCategories,
} from '../lib/supabaseService';
import { productsData as mockProducts, shopCategories as mockCategories } from '../data/products';

// ============================================================================
// 商品数据 hooks — Supabase 优先，未配置时退化 Mock
// 所有返回数据均规范化为统一前端字段（驼峰）：
//   { id, name, desc, price, originalPrice, image, category, tags, sales, rating, reviewCount }
// ============================================================================

// 统一规范化：把 Supabase 记录转成前端所需字段（与 Mock 结构保持一致）
function normalizeRemote(p) {
  return {
    id: Number(p.id),
    name: p.name,
    desc: p.description || '',
    price: Number(p.price),
    originalPrice: Number(p.original_price || p.price),
    image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
    images: p.images || [],
    category: p.category_name || '',
    categorySlug: p.category_slug || '',
    tags: p.tags || [],
    sales: p.sales ?? 0,
    rating: Number(p.rating_avg || 0),
    reviewCount: p.rating_count ?? 0,
    stock: p.stock ?? 9999,
    isFeatured: !!p.is_featured,
  };
}

// 全站商品列表（Supabase 优先）
export function useProducts() {
  const [products, setProducts] = useState(() => (isSupabaseConfigured ? [] : mockProducts));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    fetchProducts()
      .then((data) => {
        if (!alive) return;
        // 若远端为空（如 SQL 未执行），退化为 Mock，保证 UI 可用
        if (!data?.length) {
          setProducts(mockProducts);
        } else {
          setProducts(data.map(normalizeRemote));
        }
      })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { products, loading, error };
}

// 单个商品（Supabase 优先；远端无则退化 Mock）
export function useProduct(id) {
  const mock = useMemo(
    () => mockProducts.find((p) => String(p.id) === String(id)) || null,
    [id]
  );
  const [product, setProduct] = useState(() => (isSupabaseConfigured ? null : mock));
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProduct(mock);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchProductById(id)
      .then((data) => {
        if (!alive) return;
        setProduct(data ? normalizeRemote(data) : mock);
      })
      .catch(() => { if (alive) setProduct(mock); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, mock]);

  return { product, loading };
}

// 商品分类
export function useProductCategories() {
  const [categories, setCategories] = useState(() => (isSupabaseConfigured ? [] : mockCategories));

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    fetchProductCategories().then((data) => {
      if (!alive) return;
      if (!data?.length) {
        setCategories(mockCategories);
      } else {
        // 转换为前端 { id, icon, cat, key } 结构（key 保留用于 i18n）
        const slugToKey = {
          equipment: 'shop.catEquipment',
          merch: 'shop.catMerch',
          music: 'shop.catMusic',
        };
        const remote = data.map((c) => ({
          id: c.slug,
          icon: c.icon,
          cat: c.name,
          key: slugToKey[c.slug] || `shop.cat${c.slug}`,
        }));
        setCategories([{ id: 'all', icon: '📦', key: 'shop.catAll' }, ...remote]);
      }
    });
    return () => { alive = false; };
  }, []);

  return { categories };
}
