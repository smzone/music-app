import { useEffect } from 'react';

const SITE_NAME = 'MySpace';

// 自动设置页面标题，离开时恢复默认标题
export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
    return () => { document.title = prev; };
  }, [title]);
}
