import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      if (!/Android/i.test(navigator.userAgent)) return;   // Android only
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium">Установить приложение</h3>
          <p className="text-xs text-muted-foreground">Добавьте Asiatek на главный экран</p>
        </div>
        <Button
          size="sm"
          className="h-8 bg-primary hover:bg-primary/90"
          onClick={() => {
            prompt.prompt();
            prompt.userChoice.finally(() => {
              setPrompt(null);
              setShow(false);
            });
          }}
        >
          <Download className="mr-1 h-4 w-4" />
          Установить
        </Button>
      </div>
    </div>
  );
}
