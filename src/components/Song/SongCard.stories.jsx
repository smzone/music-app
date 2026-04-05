import SongCard from './SongCard';
import { songsData } from '../../data/songs';

export default {
  title: '组件/SongCard',
  component: SongCard,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
};

export const Default = { args: { song: songsData[0] } };
export const LongTitle = { args: { song: { ...songsData[0], title: '这是一个非常长的歌曲名称用来测试截断效果' } } };
export const HighRating = { args: { song: songsData[4] } };
export const ChineseSong = { args: { song: songsData[3] } };
