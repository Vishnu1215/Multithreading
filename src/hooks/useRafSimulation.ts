import { useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

export function useRafSimulation() {
  const status = useSimulationStore((s) => s.status);
  const tick = useSimulationStore((s) => s.tick);

  useEffect(() => {
    if (status !== 'running') return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Cap delta at 100ms in case of tab freeze
      tick(Math.min(delta, 100));

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [status, tick]);
}
