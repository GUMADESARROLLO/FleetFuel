interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <div className="w-full py-3">
      <div className="flex items-center mb-3">
        {Array.from({ length: totalSteps * 2 - 1 }, (_, i) => {
          if (i % 2 === 0) {
            const step = i / 2 + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
              <div
                key={i}
                className={`w-8 h-8 min-w-[2rem] rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isActive
                    ? 'bg-accent text-white ring-2 ring-accent/40'
                    : 'bg-surface-2 text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : step}
              </div>
            );
          } else {
            const step = (i - 1) / 2 + 1;
            return (
              <div
                key={i}
                className={`flex-1 h-0.5 rounded transition-all duration-300 ${
                  step <= currentStep ? 'bg-accent' : 'bg-surface-2'
                }`}
              />
            );
          }
        })}
      </div>
      <p className="text-center text-sm font-medium text-text-muted">
        Paso {currentStep} de {totalSteps}: {labels[currentStep - 1]}
      </p>
    </div>
  );
}
