'use client';

import { TrainingProvider } from './training-provider';
import SimulationContent from './simulation-content';

export default function SimulationPage() {
  return (
    <TrainingProvider>
      <SimulationContent />
    </TrainingProvider>
  );
}
