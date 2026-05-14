interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full py-3">
      <div className="flex items-center mb-3">
        {steps.map((step, idx) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="contents">
              {/* Línea conectora antes del paso (excepto el primero) */}
              {idx > 0 && (
                <div
                  className={`flex-1 h-0.5 rounded transition-all duration-300 ${
                    step <= currentStep ? "bg-accent" : "bg-surface-2"
                  }`}
                />
              )}

              {/* Círculo del paso */}
              <div
                className={`w-8 h-8 min-w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-accent text-white"
                    : isActive
                    ? "bg-accent text-white ring-2 ring-accent/40"
                    : "bg-surface-2 text-text-muted"
                }`}
              >
                {isCompleted ? "✓" : step}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm font-medium text-text-muted">
        Paso {currentStep} de {totalSteps}: {labels[currentStep - 1]}
      </p>
    </div>
  );
}
