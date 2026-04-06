export type LoadingState = { total: number; loaded: number; isLoading: boolean };

export default function LayoutLoading({ loading }: { loading: LoadingState }) {
  if (!loading.isLoading) {
    return null;
  }
  return (
    <div className="layout-loading">
      <div className="loading-gif"></div>
      <div className="loading-tip">
        模型正在加载中 ({loading.loaded}/{loading.total}) ...
      </div>
    </div>
  );
}

