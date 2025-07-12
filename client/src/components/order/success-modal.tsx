import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 p-3">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-xl">Заказ успешно отправлен!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Мы получили вашу заявку и скоро свяжемся с вами для уточнения деталей.
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 mb-4">
            <p>
              Вы можете отслеживать статус вашего заказа в личном кабинете.
              Нажмите кнопку ниже, чтобы перейти к вашим заказам.
            </p>
          </div>
        )}
        
        <DialogFooter className="mt-4 flex justify-center">
          <Button 
            onClick={onClose} 
            className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium"
          >
            {user ? 'Перейти в личный кабинет' : 'Понятно'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
