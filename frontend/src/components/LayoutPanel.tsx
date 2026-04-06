import { ReactNode } from "react";

export default function LayoutPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="layout-panel">
      <div className="panel-header">
        <div className="panel-header-title">{title}</div>
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

