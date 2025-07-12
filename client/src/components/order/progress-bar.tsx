import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center mb-12 mt-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors",
                isActive ? "bg-secondary text-white" : "bg-border text-muted-foreground"
              )}
            >
              {stepNumber}
            </div>
            
            {stepNumber < totalSteps && (
              <div 
                className={cn(
                  "h-0.5 flex-grow mx-2 transition-colors",
                  isCompleted ? "bg-secondary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressBar;
