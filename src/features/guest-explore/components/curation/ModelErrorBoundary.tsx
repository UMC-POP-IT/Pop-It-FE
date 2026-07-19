import { Component, type ReactNode } from "react";

interface ModelErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  /** modelUrl 등 로드 대상이 바뀌면 다시 시도할 수 있도록 key로 사용 */
  resetKey?: string;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

/**
 * useGLTF는 로드에 실패하면 렌더링 중 Promise rejection을 throw한다.
 * Suspense는 그 자체로 에러를 처리하지 못하므로, 목업 URL(cdn.example.com 등)처럼
 * 실제로 존재하지 않는 모델을 가리킬 때 화면이 깨지지 않도록 별도 바운더리로 감싼다.
 */
export class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ModelErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
