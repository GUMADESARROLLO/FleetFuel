interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <div class="w-full px-4 py-4">
      <div class="flex items-center gap-2 mb-3">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <div key={i} class="flex-1 flex items-center gap-2">
              <div
                class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isActive
                    ? 'bg-accent text-white ring-2 ring-accent/40'
                    : 'bg-surface-2 text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : step}
              </div>
              {i < totalSteps - 1 && (
                <div
                  class={`flex-1 h-0.5 rounded transition-all duration-300 ${
                    isCompleted ? 'bg-accent' : 'bg-surface-2'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p class="text-center text-sm font-medium text-text-muted">
        Paso {currentStep} de {totalSteps}: {labels[currentStep - 1]}
      </p>
    </div>
  );
}
