import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  return (
    <Route path={path}>
      {(params) => <ProtectedComponent component={component} params={params} />}
    </Route>
  );
}

function ProtectedComponent({ 
  component: Component, 
  params 
}: { 
  component: React.ComponentType<any>; 
  params: any 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component {...params} />;
}
