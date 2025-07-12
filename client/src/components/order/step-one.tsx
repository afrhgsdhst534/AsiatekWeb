import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepOneProps {
  vehicleType?: "passenger" | "commercial" | "chinese";
  onNext: (vehicleType: "passenger" | "commercial" | "chinese") => void;
}

const StepOne: React.FC<StepOneProps> = ({ vehicleType = "passenger", onNext }) => {
  const handleNext = () => {
    onNext(vehicleType);
  };

  const handleOptionClick = (type: "passenger" | "commercial" | "chinese") => {
    onNext(type);
  };

  return (
    <div className="step-container">
      <h2 className="text-xl font-medium text-foreground mb-6">Выберите тип транспортного средства</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Passenger Vehicle */}
        <Card 
          className={cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "passenger" && "border-2 border-primary"
          )}
          onClick={() => handleOptionClick("passenger")}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Легковой</h3>
            <p className="text-muted-foreground text-sm">Легковые автомобили и легкие грузовики</p>
          </CardContent>
        </Card>
        
        {/* Commercial Vehicle */}
        <Card 
          className={cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "commercial" && "border-2 border-primary"
          )}
          onClick={() => handleOptionClick("commercial")}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Грузовой</h3>
            <p className="text-muted-foreground text-sm">Грузовые автомобили и спецтехника</p>
          </CardContent>
        </Card>
        
        {/* Chinese Vehicle */}
        <Card 
          className={cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "chinese" && "border-2 border-primary"
          )}
          onClick={() => handleOptionClick("chinese")}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Китайский</h3>
            <p className="text-muted-foreground text-sm">Автомобили китайского производства</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={handleNext}
        >
          Продолжить
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
