// 商城商品数据（Mock）— 抽离为独立模块以便 ShopPage / ProductDetailPage 共享
// 后续接入真实后端时只需替换本文件

export const productsData = [
  { id: 1, name: '定制款音乐人T恤', price: 129, originalPrice: 199, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', rating: 4.8, sales: 234, category: '周边', tags: ['限定', '热卖'], desc: '100%纯棉定制印花，独家设计图案' },
  { id: 2, name: 'Audio-Technica ATH-M50x 监听耳机', price: 899, originalPrice: 1099, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', rating: 4.9, sales: 156, category: '设备', tags: ['推荐'], desc: '专业级监听耳机，还原真实声音' },
  { id: 3, name: '原创专辑《星空漫步》实体CD', price: 68, originalPrice: 88, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', rating: 5.0, sales: 89, category: '音乐', tags: ['签名版'], desc: '含签名版封面 + 歌词本 + 独家花絮' },
  { id: 4, name: 'MIDI键盘 Arturia MiniLab 3', price: 699, originalPrice: 799, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', rating: 4.7, sales: 78, category: '设备', tags: ['好评'], desc: '25键紧凑型MIDI控制器，适合入门' },
  { id: 5, name: '音乐人定制手机壳', price: 49, originalPrice: 79, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', rating: 4.6, sales: 567, category: '周边', tags: ['热卖'], desc: '多款图案可选，硅胶防摔材质' },
  { id: 6, name: '入门级电容麦克风套装', price: 299, originalPrice: 399, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop', rating: 4.5, sales: 123, category: '设备', tags: [], desc: '含麦克风+支架+防喷罩+声卡' },
  { id: 7, name: '音乐创作笔记本', price: 39, originalPrice: 59, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', rating: 4.8, sales: 345, category: '周边', tags: [], desc: '五线谱+空白页设计，适合记录灵感' },
  { id: 8, name: '独家数字专辑合集（数字版）', price: 29, originalPrice: 49, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', rating: 4.9, sales: 890, category: '音乐', tags: ['数字'], desc: '包含全部原创歌曲无损音质下载' },
];

export const shopCategories = [
  { id: 'all', icon: '📦', key: 'shop.catAll' },
  { id: 'equipment', icon: '🎧', key: 'shop.catEquipment', cat: '设备' },
  { id: 'merch', icon: '👕', key: 'shop.catMerch', cat: '周边' },
  { id: 'music', icon: '💿', key: 'shop.catMusic', cat: '音乐' },
];

export function getProductById(id) {
  const nid = Number(id);
  return productsData.find((p) => p.id === nid) || null;
}
