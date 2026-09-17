import React, { useCallback, useEffect, useState } from 'react';
import { ChartPointerTooltipOverlay } from '../../tooltip/chart-pointer-tooltip-overlay';
import type { StackItemTooltipContext, StackItemTooltipParams } from './stack-item-tooltip.types';
import { stackItemParamsFromShowTip } from './stack-item-tooltip.utils';

export interface UseStackItemTooltipOptions {
  active: boolean;
  renderTooltip: (params: StackItemTooltipParams) => React.ReactNode;
  contextRef: React.RefObject<StackItemTooltipContext>;
  width: number;
  height: number;
}

export interface UseStackItemTooltipResult {
  attachStackItemTooltipListeners: (chart: {
    on: (ev: string, fn: (...args: any[]) => void) => void;
    off: (ev: string, fn: (...args: any[]) => void) => void;
  }) => () => void;
  renderStackTooltipOverlay: () => React.ReactNode;
}

/**
 * Stacked track item tooltip as React Native UI (`trigger: 'item'`).
 */
export function useStackItemTooltip(options: UseStackItemTooltipOptions): UseStackItemTooltipResult {
  const { active, renderTooltip, contextRef, width, height } = options;
  const [params, setParams] = useState<StackItemTooltipParams | null>(null);

  useEffect(() => {
    if (!active) setParams(null);
  }, [active]);

  const attachStackItemTooltipListeners = useCallback(
    (chart: { on: (ev: string, fn: (...args: any[]) => void) => void; off: (ev: string, fn: (...args: any[]) => void) => void }) => {
      if (!active) return () => {};
      const onShowTip = (evt: any) => {
        const ctx = contextRef.current;
        if (!ctx?.seriesSegments?.length) {
          setParams(null);
          return;
        }
        setParams(stackItemParamsFromShowTip(chart, evt, ctx));
      };
      const onHideTip = () => setParams(null);
      chart.on('showTip', onShowTip);
      chart.on('hideTip', onHideTip);
      return () => {
        chart.off('showTip', onShowTip);
        chart.off('hideTip', onHideTip);
      };
    },
    [active, contextRef]
  );

  const renderStackTooltipOverlay = useCallback((): React.ReactNode => {
    if (!active || params == null) return null;
    return (
      <ChartPointerTooltipOverlay
        width={width}
        height={height}
        pointerX={params.pointerX}
        pointerY={params.pointerY}
      >
        {renderTooltip(params)}
      </ChartPointerTooltipOverlay>
    );
  }, [active, renderTooltip, params, width, height]);

  return {
    attachStackItemTooltipListeners,
    renderStackTooltipOverlay,
  };
}
