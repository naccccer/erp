import type { ReactNode } from 'react';

export type VisibilityCheckpointStatus = 'idle' | 'success' | 'error';

type VisibilityCheckpointProps = {
  titleId: string;
  dataSummary: string;
  lastResult: string;
  status: VisibilityCheckpointStatus;
  tenantId: string;
  title?: string;
  children?: ReactNode;
};

function statusLabel(status: VisibilityCheckpointStatus): string {
  if (status === 'success') {
    return 'موفق';
  }

  if (status === 'error') {
    return 'خطا';
  }

  return 'در انتظار';
}

export function VisibilityCheckpoint({
  titleId,
  dataSummary,
  lastResult,
  status,
  tenantId,
  title = 'checkpoint مشاهده پذیری',
  children,
}: VisibilityCheckpointProps) {
  return (
    <section className={`visibility-checkpoint visibility-checkpoint--${status}`} aria-labelledby={titleId}>
      <div className="visibility-checkpoint__header">
        <h2 id={titleId} className="visibility-checkpoint__title">
          {title}
        </h2>
        <span className={`visibility-checkpoint__status visibility-checkpoint__status--${status}`}>
          وضعیت: {statusLabel(status)}
        </span>
      </div>
      <p className="visibility-checkpoint__line">{dataSummary}</p>
      <p className="visibility-checkpoint__line">
        tenant فعال: <span dir="ltr">{tenantId}</span>
      </p>
      <p className="visibility-checkpoint__line">آخرین نتیجه عملیات: {lastResult}</p>
      {children}
    </section>
  );
}
