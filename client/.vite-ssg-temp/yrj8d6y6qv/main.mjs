import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { Route, Redirect, Link, useLocation, useRoute, Switch } from "wouter";
import { QueryClient, useQuery, useMutation, useQueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import React__default, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Loader2, X, Download, ChevronDown, ChevronUp, Check, Trash2, Plus, ChevronRight, Circle, EyeOff, Eye, AlertCircle, CheckCircle, Package, User, LogOut, Edit, Menu } from "lucide-react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { Helmet as Helmet$1 } from "react-helmet-async";
import { FaClock, FaTools, FaSearch, FaTruck, FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { useFormContext, FormProvider, Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
async function throwIfResNotOk(res) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      } else {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}
async function apiRequest(method, url, data) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : void 0,
    credentials: "include"
  });
  await throwIfResNotOk(res);
  return res;
}
const getQueryFn = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  try {
    const res = await fetch(queryKey[0], {
      credentials: "include"
    });
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }
    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    console.error(`Query error for ${queryKey[0]}:`, error);
    if (unauthorizedBehavior === "returnNull") {
      return null;
    }
    throw error;
  }
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false
    },
    mutations: {
      retry: false
    }
  }
});
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const { toast: toast2 } = useToast();
  const {
    data: user,
    error,
    isLoading
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 10 * 60 * 1e3
    // 10 minutes
  });
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user2) => {
      queryClient.setQueryData(["/api/user"], user2);
      toast2({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему"
      });
    },
    onError: (error2) => {
      toast2({
        title: "Ошибка входа",
        description: error2.message,
        variant: "destructive"
      });
    }
  });
  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user2) => {
      queryClient.setQueryData(["/api/user"], user2);
      toast2({
        title: "Успешная регистрация",
        description: "Вы успешно зарегистрировались в системе"
      });
    },
    onError: (error2) => {
      toast2({
        title: "Ошибка регистрации",
        description: error2.message,
        variant: "destructive"
      });
    }
  });
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast2({
        title: "Выход из системы",
        description: "Вы успешно вышли из системы"
      });
    },
    onError: (error2) => {
      toast2({
        title: "Ошибка выхода",
        description: error2.message,
        variant: "destructive"
      });
    }
  });
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation
      },
      children
    }
  );
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
function ProtectedRoute({
  path,
  component
}) {
  return /* @__PURE__ */ jsx(Route, { path, children: (params) => /* @__PURE__ */ jsx(ProtectedComponent, { component, params }) });
}
function ProtectedComponent({
  component: Component,
  params
}) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Redirect, { to: "/auth" });
  }
  return /* @__PURE__ */ jsx(Component, { ...params });
}
let ssgMetadata = {
  title: "",
  meta: [],
  link: [],
  script: [],
  htmlAttributes: {},
  bodyAttributes: {}
};
const getMetadata = () => {
  return {
    toString: () => JSON.stringify(ssgMetadata),
    title: { toString: () => ssgMetadata.title },
    meta: { toString: () => ssgMetadata.meta.join("") },
    link: { toString: () => ssgMetadata.link.join("") },
    script: { toString: () => ssgMetadata.script.join("") },
    htmlAttributes: { toString: () => Object.entries(ssgMetadata.htmlAttributes).map(([key, value]) => `${key}="${value}"`).join(" ") },
    bodyAttributes: { toString: () => Object.entries(ssgMetadata.bodyAttributes).map(([key, value]) => `${key}="${value}"`).join(" ") }
  };
};
const Helmet = (props) => {
  if (props.title) {
    ssgMetadata.title = `<title>${props.title}</title>`;
  }
  if (props.meta) {
    props.meta.forEach((meta) => {
      const attributes = Object.entries(meta).map(([key, value]) => `${key}="${value}"`).join(" ");
      ssgMetadata.meta.push(`<meta ${attributes}>`);
    });
  }
  if (props.link) {
    props.link.forEach((link) => {
      const attributes = Object.entries(link).map(([key, value]) => `${key}="${value}"`).join(" ");
      ssgMetadata.link.push(`<link ${attributes}>`);
    });
  }
  if (props.script) {
    props.script.forEach((script) => {
      const attributes = Object.entries(script).filter(([key]) => key !== "children").map(([key, value]) => `${key}="${value}"`).join(" ");
      if (script.children) {
        ssgMetadata.script.push(`<script ${attributes}>${script.children}<\/script>`);
      } else {
        ssgMetadata.script.push(`<script ${attributes}><\/script>`);
      }
    });
  }
  if (props.htmlAttributes) {
    Object.assign(ssgMetadata.htmlAttributes, props.htmlAttributes);
  }
  if (props.bodyAttributes) {
    Object.assign(ssgMetadata.bodyAttributes, props.bodyAttributes);
  }
  return React__default.createElement(React__default.Fragment, null, props.children);
};
const HelmetProvider = (props) => {
  if (props.context) {
    props.context.helmet = getMetadata();
    props.context;
  }
  return React__default.createElement(React__default.Fragment, null, props.children);
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    ToastPrimitives.Root,
    {
      ref,
      className: cn(toastVariants({ variant }), className),
      ...props
    }
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Description,
  {
    ref,
    className: cn("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      if (!/Android/i.test(navigator.userAgent)) return;
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!show) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium", children: "Установить приложение" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Добавьте Asiatek на главный экран" })
    ] }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        size: "sm",
        className: "h-8 bg-primary hover:bg-primary/90",
        onClick: () => {
          prompt.prompt();
          prompt.userChoice.finally(() => {
            setPrompt(null);
            setShow(false);
          });
        },
        children: [
          /* @__PURE__ */ jsx(Download, { className: "mr-1 h-4 w-4" }),
          "Установить"
        ]
      }
    )
  ] }) });
}
function LocalBusinessLD() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Asiatek",
    "image": "https://asiatek.pro/logo-og.png",
    "url": "https://asiatek.pro",
    "telephone": "+992931234567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "пр‑т Рудаки 21",
      "addressLocality": "Душанбе",
      "postalCode": "734000",
      "addressCountry": "TJ"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "geo": { "@type": "GeoCoordinates", "latitude": 38.5601, "longitude": 68.787 }
  };
  return /* @__PURE__ */ jsx(Helmet$1, { children: /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(data) }) });
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
function InfiniteMovingTicker({
  items,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  gap = 50,
  className = "",
  verticalOnMobile = false
}) {
  const isMobile = useIsMobile();
  const orientation = verticalOnMobile && isMobile ? "vertical" : "horizontal";
  const axis = orientation === "horizontal" ? "X" : "Y";
  const containerRef = useRef(null);
  const distance = useRef(0);
  const cycle = useRef(0);
  const frame = useRef(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      cycle.current = orientation === "horizontal" ? el.scrollWidth / 2 : el.scrollHeight / 2;
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items, orientation]);
  useEffect(() => {
    const start = performance.now();
    let last = start;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (!paused && cycle.current) {
        const delta = speed * dt / 1e3;
        distance.current += direction === "left" ? -delta : delta;
        if (distance.current <= -cycle.current)
          distance.current += cycle.current;
        if (distance.current >= 0) distance.current -= cycle.current;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate${axis}(${distance.current}px)`;
        }
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [direction, speed, paused, orientation]);
  const stripStyle = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: `${gap}px`,
    willChange: "transform"
  };
  const fadeMask = orientation === "horizontal" ? "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" : "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `relative overflow-hidden ${className}`,
      style: {
        maskImage: fadeMask,
        WebkitMaskImage: fadeMask
      },
      onMouseEnter: () => pauseOnHover && setPaused(true),
      onMouseLeave: () => pauseOnHover && setPaused(false),
      children: /* @__PURE__ */ jsx("div", { ref: containerRef, style: stripStyle, children: [...items, ...items].map((item, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-16 h-16 flex-none flex items-center justify-center",
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: item.image,
              alt: item.alt,
              loading: "lazy",
              draggable: false,
              className: "max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
            }
          )
        },
        i < items.length ? item.id : `dup-${item.id}`
      )) })
    }
  );
}
const firstTickerLogos = [
  {
    id: "logo-1",
    image: "/assets/logos/Mask group.png",
    alt: "Auto Brand Logo 1"
  },
  {
    id: "logo-2",
    image: "/assets/logos/Mask group-1.png",
    alt: "Auto Brand Logo 2"
  },
  {
    id: "logo-3",
    image: "/assets/logos/Mask group-2.png",
    alt: "Auto Brand Logo 3"
  },
  {
    id: "logo-4",
    image: "/assets/logos/Mask group-3.png",
    alt: "Auto Brand Logo 4"
  },
  {
    id: "logo-5",
    image: "/assets/logos/Mask group-4.png",
    alt: "Auto Brand Logo 5"
  },
  {
    id: "logo-6",
    image: "/assets/logos/Mask group-5.png",
    alt: "Auto Brand Logo 6"
  },
  {
    id: "logo-7",
    image: "/assets/logos/Mask group-6.png",
    alt: "Auto Brand Logo 7"
  },
  {
    id: "logo-8",
    image: "/assets/logos/Mask group-7.png",
    alt: "Auto Brand Logo 8"
  },
  {
    id: "logo-9",
    image: "/assets/logos/image 74.png",
    alt: "Auto Brand Logo 9"
  }
];
const secondTickerLogos = [
  {
    id: "row2-logo-1",
    image: "/assets/logos/row2/Mask group.png",
    alt: "Truck Brand Logo 1"
  },
  {
    id: "row2-logo-2",
    image: "/assets/logos/row2/Mask group-1.png",
    alt: "Truck Brand Logo 2"
  },
  {
    id: "row2-logo-3",
    image: "/assets/logos/row2/Mask group-2.png",
    alt: "Truck Brand Logo 3"
  },
  {
    id: "row2-logo-4",
    image: "/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_41_05 PM.png",
    alt: "SINOTRUK Logo"
  },
  {
    id: "row2-logo-5",
    image: "/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_42_46 PM.png",
    alt: "HOWO Logo"
  },
  {
    id: "row2-logo-6",
    image: "/assets/logos/row2/Mask group-4.png",
    alt: "Truck Brand Logo 6"
  }
];
const thirdTickerLogos = [
  {
    id: "row3-logo-1",
    image: "/assets/logos/row3/Mask group.png",
    alt: "Car Brand Logo 1"
  },
  {
    id: "row3-logo-2",
    image: "/assets/logos/row3/Mask group-1.png",
    alt: "Car Brand Logo 2"
  },
  {
    id: "row3-logo-3",
    image: "/assets/logos/row3/Mask group-2.png",
    alt: "Car Brand Logo 3"
  },
  {
    id: "row3-logo-4",
    image: "/assets/logos/row3/Mask group-3.png",
    alt: "Car Brand Logo 4"
  },
  {
    id: "row3-logo-5",
    image: "/assets/logos/row3/Mask group-4.png",
    alt: "Car Brand Logo 5"
  },
  {
    id: "row3-logo-6",
    image: "/assets/logos/row3/Mask group-5.png",
    alt: "Car Brand Logo 6"
  },
  {
    id: "row3-logo-7",
    image: "/assets/logos/row3/Mask group-6.png",
    alt: "Car Brand Logo 7"
  },
  {
    id: "row3-logo-8",
    image: "/assets/logos/row3/Mask group-7.png",
    alt: "Car Brand Logo 8"
  },
  {
    id: "row3-logo-9",
    image: "/assets/logos/row3/Mask group-8.png",
    alt: "Car Brand Logo 9"
  },
  {
    id: "row3-logo-10",
    image: "/assets/logos/row3/Mask group-9.png",
    alt: "Car Brand Logo 10"
  }
];
const Seo = ({
  title,
  description,
  path,
  image = "/assets/Group 17.png",
  type = "website",
  brand,
  noindex = false,
  children
}) => {
  const siteUrl = "https://asiatek.pro";
  const url = `${siteUrl}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  return /* @__PURE__ */ jsxs(Helmet, { children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    noindex && /* @__PURE__ */ jsx("meta", { name: "robots", content: "noindex, nofollow" }),
    noindex && /* @__PURE__ */ jsx("meta", { name: "googlebot", content: "noindex, nofollow" }),
    noindex && /* @__PURE__ */ jsx("meta", { name: "yandex", content: "noindex, nofollow" }),
    /* @__PURE__ */ jsx("link", { rel: "canonical", href: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: type }),
    /* @__PURE__ */ jsx("meta", { property: "og:url", content: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: title }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: description }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: imageUrl }),
    /* @__PURE__ */ jsx("meta", { property: "og:locale", content: "ru_RU" }),
    /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "Asiatek" }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:url", content: url }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: title }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: imageUrl }),
    type === "product" && brand && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("meta", { property: "og:brand", content: brand }),
      /* @__PURE__ */ jsx("meta", { property: "product:brand", content: brand }),
      /* @__PURE__ */ jsx("meta", { property: "product:availability", content: "in stock" })
    ] }),
    /* @__PURE__ */ jsx("meta", { name: "geo.region", content: "RU" }),
    /* @__PURE__ */ jsx("meta", { name: "geo.placename", content: "Москва" }),
    /* @__PURE__ */ jsx("meta", { name: "language", content: "Russian" }),
    /* @__PURE__ */ jsx("meta", { name: "yandex-verification", content: "verification_token" }),
    /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
    /* @__PURE__ */ jsx("meta", { name: "format-detection", content: "telephone=no" }),
    children
  ] });
};
const FAQ = ({ items }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
  return /* @__PURE__ */ jsx(Helmet$1, { children: /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(structuredData) }) });
};
const HomePage = () => {
  const isMobile = useIsMobile();
  const faqItems = [
    {
      question: "Какие автозапчасти вы предлагаете?",
      answer: "Мы предлагаем широкий ассортимент оригинальных и аналоговых запчастей для легковых, коммерческих и китайских автомобилей. В нашем каталоге представлены детали для Toyota, Nissan, Honda, Mitsubishi, Mazda, Isuzu, Hino, Geely, Chery, Haval и многих других марок."
    },
    {
      question: "Как заказать запчасти в вашем магазине?",
      answer: "Вы можете оформить заказ, заполнив форму на нашем сайте, где нужно указать данные автомобиля, необходимые запчасти и контактную информацию. Наши специалисты свяжутся с вами для уточнения деталей заказа."
    },
    {
      question: "Как осуществляется доставка запчастей?",
      answer: "Мы доставляем запчасти по всей России через транспортные компании СДЭК, Деловые Линии, ПЭК и других. Также возможен самовывоз из нашего офиса в Москве. Сроки доставки зависят от вашего региона и обычно составляют от 1 до 7 рабочих дней."
    },
    {
      question: "Какие гарантии вы предоставляете на запчасти?",
      answer: "На все запчасти мы предоставляем гарантию в соответствии с гарантийной политикой производителя. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя."
    },
    {
      question: "Можно ли вернуть или обменять запчасти?",
      answer: "Да, вы можете вернуть или обменять запчасти в течение 14 дней с момента получения, если они не были в использовании, сохранены товарный вид, пломбы, ярлыки и заводская упаковка. При обнаружении заводского брака срок возврата увеличивается до 30 дней."
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "АВТОЗАПЧАСТИ ОПТОМ И В РОЗНИЦУ – Asiatek",
        description: "Купить оригинальные и аналоговые автозапчасти для китайских, коммерческих и легковых автомобилей. Доставка по России.",
        path: "/",
        image: "/assets/Stickers.png"
      }
    ),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems }),
    /* @__PURE__ */ jsxs("section", { className: "relative h-[100vh] md:h-screen w-full overflow-hidden bg-gray-50", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 hidden md:flex flex-col justify-between overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "py-6 md:py-10 lg:py-12 mt-20 md:mt-24", children: /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: firstTickerLogos,
            direction: "left",
            speed: 35,
            gap: 60,
            className: "py-8 backdrop-blur-sm"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "py-6 md:py-10 lg:py-12", children: /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: secondTickerLogos,
            direction: "right",
            speed: 25,
            gap: 60,
            className: "py-8 backdrop-blur-sm"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "py-6 md:py-10 lg:py-12 mb-20 md:mb-24", children: /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: thirdTickerLogos,
            direction: "left",
            speed: 30,
            gap: 60,
            className: "py-8 backdrop-blur-sm"
          }
        ) })
      ] }),
      isMobile && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center overflow-hidden z-0", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 w-full h-full px-4", children: [
        /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: firstTickerLogos,
            direction: "left",
            speed: 35,
            gap: 60,
            className: "w-full h-full",
            verticalOnMobile: true
          }
        ),
        /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: secondTickerLogos,
            direction: "right",
            speed: 25,
            gap: 60,
            className: "w-full h-full",
            verticalOnMobile: true
          }
        ),
        /* @__PURE__ */ jsx(
          InfiniteMovingTicker,
          {
            items: thirdTickerLogos,
            direction: "left",
            speed: 30,
            gap: 60,
            className: "w-full h-full",
            verticalOnMobile: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "relative z-10 flex items-center justify-center h-full px-4", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "\n              flex flex-col text-center bg-white\n              border-[5px] border-[rgba(172,142,104,0.2)]\n              rounded-[20px] shadow-lg\n\n              w-[90%] max-w-[402px]          /* desktop width cap */\n              sm:max-w-[402px]\n              px-10 py-10                    /* 40 px padding all sides */\n              space-y-8                      /* equal vertical rhythm */\n            ",
          children: [
            /* @__PURE__ */ jsxs("h1", { className: "font-['Roboto_Condensed'] font-black tracking-[-0.03em] leading-tight\n                           text-[32px] sm:text-[40px]", children: [
              "АВТОЗАПЧАСТИ",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-black", children: "ОПТОМ И В РОЗНИЦУ" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-['Inter'] font-medium text-sm sm:text-base leading-relaxed tracking-[-0.03em] text-gray-700/90", children: "Оставьте короткую заявку — это займёт всего 3 минуты. Просто укажите данные автомобиля, что вам нужно, и как с вами связаться." }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: "/assets/Stickers.png",
                alt: "Примеры запчастей",
                className: "h-[90px] sm:h-[110px] object-contain drop-shadow-md",
                draggable: false,
                onError: (e) => e.currentTarget.style.display = "none"
              }
            ) }),
            /* @__PURE__ */ jsx(Link, { href: "/order", className: "mx-auto", children: /* @__PURE__ */ jsx(
              Button,
              {
                className: "\n                  bg-black hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black\n                  w-full max-w-[334px] h-[60px] sm:h-[65px]\n                  rounded-[15px] sm:rounded-[17px] shadow-md\n                  transition-transform duration-200 hover:scale-105\n                ",
                children: /* @__PURE__ */ jsx("span", { className: "font-['Inter'] text-base sm:text-lg font-medium tracking-[-0.02em] uppercase", children: "ОСТАВИТЬ ЗАЯВКУ" })
              }
            ) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-gray-50/20 via-gray-50/5 to-gray-50/20 pointer-events-none" })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-20 md:py-24 bg-gradient-to-b from-secondary/5 to-white", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 font-['Roboto_Condensed'] tracking-tight", children: "НАШИ ПРЕИМУЩЕСТВА" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300", children: /* @__PURE__ */ jsx(FaClock, { className: "w-8 h-8 text-primary" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']", children: "БЫСТРЫЙ ЗАКАЗ" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-['Inter'] text-base md:text-lg", children: "Простая форма заказа займёт всего 3 минуты вашего времени" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300", children: /* @__PURE__ */ jsx(FaTools, { className: "w-8 h-8 text-primary" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']", children: "ОРИГИНАЛЬНЫЕ ЗАПЧАСТИ" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-['Inter'] text-base md:text-lg", children: "Мы работаем только с проверенными поставщиками оригинальных деталей" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300", children: /* @__PURE__ */ jsx(FaSearch, { className: "w-8 h-8 text-primary" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']", children: "ШИРОКИЙ АССОРТИМЕНТ" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-['Inter'] text-base md:text-lg", children: "Запчасти для любых марок автомобилей включая редкие модели" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300", children: /* @__PURE__ */ jsx(FaTruck, { className: "w-8 h-8 text-primary" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl md:text-2xl font-bold mb-3 font-['Roboto_Condensed']", children: "БЫСТРАЯ ДОСТАВКА" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-['Inter'] text-base md:text-lg", children: "Доставим заказ в кратчайшие сроки в любую точку России" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "py-16 md:py-20 bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 to-transparent" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent to-white/10" }),
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 text-center relative z-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 font-['Roboto_Condensed'] tracking-tight", children: "ГОТОВЫ ЗАКАЗАТЬ ЗАПЧАСТИ?" }),
        /* @__PURE__ */ jsx("p", { className: "text-white/90 text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-['Inter'] leading-relaxed", children: "Не тратьте время на поиски. Оставьте заявку, и мы поможем найти необходимые запчасти для вашего автомобиля по лучшим ценам." }),
        /* @__PURE__ */ jsx(Link, { href: "/order", children: /* @__PURE__ */ jsx(
          Button,
          {
            className: "bg-white text-[#ac8e68] hover:bg-white/90 py-4 px-10 w-[280px] sm:w-[300px] md:w-[334px] h-[60px] md:h-[65px] rounded-full text-center font-medium border-[2.55px] border-white/20 shadow-lg transform transition hover:scale-105 hover:shadow-xl",
            size: "lg",
            children: /* @__PURE__ */ jsx("span", { className: "font-['Inter'] text-lg sm:text-xl md:text-2xl font-medium tracking-[-0.02em] leading-none uppercase", children: "ОСТАВИТЬ ЗАЯВКУ" })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjIuOCAyLjIgMS44cy0xIDEuOC0yLjIgMS44LTIuMi0uOC0yLjItMS44IDEtMS44IDIuMi0xLjh6bTkuOSAzLjZjLjcgMCAxLjMuNSAxLjMgMS4xcy0uNiAxLjEtMS4zIDEuMS0xLjMtLjUtMS4zLTEuMS42LTEuMSAxLjMtMS4xeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-20" })
    ] })
  ] });
};
const ProgressBar = ({ currentStep, totalSteps }) => {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center mb-12 mt-6", children: Array.from({ length: totalSteps }).map((_, index) => {
    const stepNumber = index + 1;
    const isActive = stepNumber <= currentStep;
    const isCompleted = stepNumber < currentStep;
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-1 last:flex-none", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors",
            isActive ? "bg-secondary text-white" : "bg-border text-muted-foreground"
          ),
          children: stepNumber
        }
      ),
      stepNumber < totalSteps && /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "h-0.5 flex-grow mx-2 transition-colors",
            isCompleted ? "bg-secondary" : "bg-border"
          )
        }
      )
    ] }, stepNumber);
  }) });
};
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h3",
  {
    ref,
    className: cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "p",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
const StepOne = ({ vehicleType = "passenger", onNext }) => {
  const handleNext = () => {
    onNext(vehicleType);
  };
  const handleOptionClick = (type) => {
    onNext(type);
  };
  return /* @__PURE__ */ jsxs("div", { className: "step-container", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-foreground mb-6", children: "Выберите тип транспортного средства" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(
        Card,
        {
          className: cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "passenger" && "border-2 border-primary"
          ),
          onClick: () => handleOptionClick("passenger"),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Легковой" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Легковые автомобили и легкие грузовики" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Card,
        {
          className: cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "commercial" && "border-2 border-primary"
          ),
          onClick: () => handleOptionClick("commercial"),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Грузовой" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Грузовые автомобили и спецтехника" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Card,
        {
          className: cn(
            "cursor-pointer transition hover:border-primary",
            vehicleType === "chinese" && "border-2 border-primary"
          ),
          onClick: () => handleOptionClick("chinese"),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "Китайский" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Автомобили китайского производства" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-end", children: /* @__PURE__ */ jsx(
      Button,
      {
        type: "button",
        className: "bg-primary hover:bg-primary/90 text-white",
        onClick: handleNext,
        children: "Продолжить"
      }
    ) })
  ] });
};
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
const Form = FormProvider;
const FormFieldContext = React.createContext(
  {}
);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext(
  {}
);
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();
  return /* @__PURE__ */ jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx(
    Label,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx(
    Slot,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error == null ? void 0 : error.message) : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-sm font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
z.object({
  vin: z.string().optional().refine(
    (val) => !val || val.length === 17,
    { message: "VIN должен содержать 17 символов" }
  ),
  make: z.string().min(1, "Обязательное поле").optional(),
  model: z.string().min(1, "Обязательное поле").optional(),
  year: z.string().min(1, "Обязательное поле").optional().refine(
    (val) => !val || /^\d{4}$/.test(val),
    { message: "Год должен быть в формате ГГГГ" }
  ),
  engineVolume: z.string().optional(),
  fuelType: z.string().optional()
});
const StepTwo = ({ vehicle, onBack, onNext }) => {
  const isChinese = vehicle.type === "chinese";
  const [inputMethod, setInputMethod] = useState(
    isChinese ? "manual" : "vin"
  );
  const form = useForm({
    resolver: zodResolver(
      inputMethod === "vin" && !isChinese ? z.object({
        vin: z.string().min(17, "VIN должен содержать 17 символов"),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.string().optional(),
        engineVolume: z.string().optional(),
        fuelType: z.string().optional()
      }) : z.object({
        vin: z.string().optional(),
        make: z.string().min(1, "Обязательное поле"),
        model: z.string().min(1, "Обязательное поле"),
        year: z.string().min(1, "Обязательное поле"),
        engineVolume: z.string().optional(),
        fuelType: z.string().optional()
      })
    ),
    defaultValues: {
      vin: vehicle.vin || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "",
      engineVolume: vehicle.engineVolume || "",
      fuelType: vehicle.fuelType || ""
    }
  });
  useEffect(() => {
    form.reset({
      vin: vehicle.vin || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year ? String(vehicle.year) : "",
      engineVolume: vehicle.engineVolume || "",
      fuelType: vehicle.fuelType || ""
    });
    form.clearErrors();
  }, [inputMethod, vehicle, form]);
  const onSubmit = (values) => {
    console.log("Form submitted with values:", values);
    const vehicleData = {
      ...vehicle
    };
    if (inputMethod === "vin" && !isChinese) {
      vehicleData.vin = values.vin || "";
      vehicleData.make = void 0;
      vehicleData.model = void 0;
      vehicleData.year = void 0;
      vehicleData.engineVolume = void 0;
      vehicleData.fuelType = void 0;
    } else {
      vehicleData.vin = void 0;
      vehicleData.make = values.make || "";
      vehicleData.model = values.model || "";
      vehicleData.year = values.year && values.year.trim() !== "" ? parseInt(values.year) : void 0;
      vehicleData.engineVolume = values.engineVolume || "";
      vehicleData.fuelType = values.fuelType || "";
    }
    onNext(vehicleData);
  };
  return /* @__PURE__ */ jsxs("div", { className: "step-container", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-foreground mb-6", children: "Информация о транспортном средстве" }),
    !isChinese && /* @__PURE__ */ jsxs("div", { className: "flex mb-6 space-x-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          className: cn(
            "flex-1",
            inputMethod === "vin" ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted/30 hover:bg-muted/50 text-foreground"
          ),
          onClick: () => setInputMethod("vin"),
          children: "По VIN"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          className: cn(
            "flex-1",
            inputMethod === "manual" ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted/30 hover:bg-muted/50 text-foreground"
          ),
          onClick: () => setInputMethod("manual"),
          children: "Вручную"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [
      !isChinese && inputMethod === "vin" && /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "vin",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { children: "VIN номер" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Например: 1HGCM82633A123456",
                maxLength: 17,
                ...field
              }
            ) }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "VIN номер содержит 17 символов и обычно находится в документах на автомобиль." }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      (isChinese || inputMethod === "manual") && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "make",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Марка" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Toyota, BMW, и т.д.", ...field }) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "model",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Модель" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Camry, X5, и т.д.", ...field }) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "year",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Год" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "2022", ...field, type: "number" }) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "engineVolume",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Объем двигателя" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "2.0, 3.5, и т.д.", ...field }) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "fuelType",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Тип топлива" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    onValueChange: field.onChange,
                    defaultValue: field.value,
                    children: [
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Выберите тип топлива" }) }) }),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsx(SelectItem, { value: "petrol", children: "Бензин" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "diesel", children: "Дизель" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "gas", children: "Газ" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "hybrid", children: "Гибрид" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "electric", children: "Электро" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-between", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: onBack,
            children: "Назад"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "bg-primary hover:bg-primary/90 text-white",
            children: "Продолжить"
          }
        )
      ] })
    ] }) })
  ] });
};
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const partSchema = z.object({
  name: z.string().min(1, "Название запчасти обязательно"),
  quantity: z.number().min(1, "Минимальное количество 1"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional()
});
const formSchema$1 = z.object({
  parts: z.array(partSchema).min(1, "Добавьте хотя бы одну запчасть")
});
const StepThree = ({ parts, onBack, onNext }) => {
  const defaultParts = parts.length > 0 ? parts.map((part) => ({
    name: part.name || "",
    quantity: part.quantity || 1,
    sku: part.sku || "",
    brand: part.brand || "",
    description: part.description || ""
  })) : [{ name: "", quantity: 1, sku: "", brand: "", description: "" }];
  const form = useForm({
    resolver: zodResolver(formSchema$1),
    defaultValues: {
      parts: defaultParts
    },
    mode: "onChange"
  });
  const { fields, append, remove } = useFieldArray({
    name: "parts",
    control: form.control
  });
  const onSubmit = (values) => {
    onNext(values.parts);
  };
  const addPart = () => {
    append({ name: "", quantity: 1, sku: "", brand: "", description: "" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "step-container", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-foreground mb-6", children: "Запчасти" }),
    /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: fields.map((field, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border border-border rounded-md p-6 space-y-4",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(
                FormField,
                {
                  control: form.control,
                  name: `parts.${index}.name`,
                  render: ({ field: field2 }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                    /* @__PURE__ */ jsx(FormLabel, { children: "Название запчасти *" }),
                    /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Например: Тормозной диск", ...field2 }) }),
                    /* @__PURE__ */ jsx(FormMessage, {})
                  ] })
                }
              ) }),
              /* @__PURE__ */ jsx(
                FormField,
                {
                  control: form.control,
                  name: `parts.${index}.sku`,
                  render: ({ field: field2 }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                    /* @__PURE__ */ jsx(FormLabel, { children: "Артикул (если есть)" }),
                    /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "SKU или номер", ...field2 }) }),
                    /* @__PURE__ */ jsx(FormMessage, {})
                  ] })
                }
              ),
              /* @__PURE__ */ jsx(
                FormField,
                {
                  control: form.control,
                  name: `parts.${index}.quantity`,
                  render: ({ field: field2 }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                    /* @__PURE__ */ jsx(FormLabel, { children: "Количество" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          type: "button",
                          variant: "outline",
                          className: "rounded-r-none",
                          onClick: () => field2.onChange(Math.max(1, field2.value - 1)),
                          children: "-"
                        }
                      ),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "number",
                          className: "rounded-none text-center",
                          min: 1,
                          ...field2,
                          onChange: (e) => {
                            const value = parseInt(e.target.value);
                            field2.onChange(isNaN(value) ? 1 : Math.max(1, value));
                          }
                        }
                      ) }),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          type: "button",
                          variant: "outline",
                          className: "rounded-l-none",
                          onClick: () => field2.onChange(field2.value + 1),
                          children: "+"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(FormMessage, {})
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: `parts.${index}.brand`,
                render: ({ field: field2 }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Бренд (если есть предпочтение)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Например: Bosch, TRW, и т.д.", ...field2 }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: `parts.${index}.description`,
                render: ({ field: field2 }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Комментарий" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      placeholder: "Дополнительная информация о запчасти",
                      className: "resize-none",
                      rows: 2,
                      ...field2
                    }
                  ) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            fields.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                className: "text-destructive hover:text-destructive/90 hover:bg-destructive/10",
                onClick: () => remove(index),
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 mr-2" }),
                  "Удалить"
                ]
              }
            ) })
          ]
        },
        field.id
      )) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          className: "text-secondary hover:text-secondary/90 flex items-center",
          onClick: addPart,
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5 mr-2" }),
            "Добавить еще запчасть"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-between", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: onBack,
            children: "Назад"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "bg-primary hover:bg-primary/90 text-white",
            children: "Продолжить"
          }
        )
      ] })
    ] }) })
  ] });
};
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const countries = [
  {
    name: "Россия",
    code: "RU",
    flag: "🇷🇺",
    dialCode: "+7",
    format: "XXX XXX XX XX",
    maxLength: 10
  },
  {
    name: "Tajikistan",
    code: "TJ",
    flag: "🇹🇯",
    dialCode: "+992",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Казахстан",
    code: "KZ",
    flag: "🇰🇿",
    dialCode: "+7",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Украина",
    code: "UA",
    flag: "🇺🇦",
    dialCode: "+380",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Беларусь",
    code: "BY",
    flag: "🇧🇾",
    dialCode: "+375",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Afghanistan",
    code: "AF",
    flag: "🇦🇫",
    dialCode: "+93",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Albania",
    code: "AL",
    flag: "🇦🇱",
    dialCode: "+355",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Algeria",
    code: "DZ",
    flag: "🇩🇿",
    dialCode: "+213",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Andorra",
    code: "AD",
    flag: "🇦🇩",
    dialCode: "+376",
    format: "XXX XXX",
    maxLength: 6
  },
  {
    name: "Angola",
    code: "AO",
    flag: "🇦🇴",
    dialCode: "+244",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Argentina",
    code: "AR",
    flag: "🇦🇷",
    dialCode: "+54",
    format: "XX XXXX XXXX",
    maxLength: 10
  },
  {
    name: "Armenia",
    code: "AM",
    flag: "🇦🇲",
    dialCode: "+374",
    format: "XX XXX XXX",
    maxLength: 8
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    dialCode: "+61",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Austria",
    code: "AT",
    flag: "🇦🇹",
    dialCode: "+43",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Azerbaijan",
    code: "AZ",
    flag: "🇦🇿",
    dialCode: "+994",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Bahamas",
    code: "BS",
    flag: "🇧🇸",
    dialCode: "+1242",
    format: "XXX XXXX",
    maxLength: 7
  },
  {
    name: "Bahrain",
    code: "BH",
    flag: "🇧🇭",
    dialCode: "+973",
    format: "XXXX XXXX",
    maxLength: 8
  },
  {
    name: "Bangladesh",
    code: "BD",
    flag: "🇧🇩",
    dialCode: "+880",
    format: "XXXX XXXX",
    maxLength: 10
  },
  {
    name: "Belgium",
    code: "BE",
    flag: "🇧🇪",
    dialCode: "+32",
    format: "XXX XX XX XX",
    maxLength: 9
  },
  {
    name: "Brazil",
    code: "BR",
    flag: "🇧🇷",
    dialCode: "+55",
    format: "XX XXXXX XXXX",
    maxLength: 11
  },
  {
    name: "Bulgaria",
    code: "BG",
    flag: "🇧🇬",
    dialCode: "+359",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    dialCode: "+1",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "China",
    code: "CN",
    flag: "🇨🇳",
    dialCode: "+86",
    format: "XXX XXXX XXXX",
    maxLength: 11
  },
  {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    dialCode: "+57",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Croatia",
    code: "HR",
    flag: "🇭🇷",
    dialCode: "+385",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Czech Republic",
    code: "CZ",
    flag: "🇨🇿",
    dialCode: "+420",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Denmark",
    code: "DK",
    flag: "🇩🇰",
    dialCode: "+45",
    format: "XX XX XX XX",
    maxLength: 8
  },
  {
    name: "Egypt",
    code: "EG",
    flag: "🇪🇬",
    dialCode: "+20",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Estonia",
    code: "EE",
    flag: "🇪🇪",
    dialCode: "+372",
    format: "XXXX XXXX",
    maxLength: 8
  },
  {
    name: "Finland",
    code: "FI",
    flag: "🇫🇮",
    dialCode: "+358",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    dialCode: "+33",
    format: "X XX XX XX XX",
    maxLength: 9
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    dialCode: "+49",
    format: "XXXX XXXXXXX",
    maxLength: 11
  },
  {
    name: "Greece",
    code: "GR",
    flag: "🇬🇷",
    dialCode: "+30",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Hungary",
    code: "HU",
    flag: "🇭🇺",
    dialCode: "+36",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Iceland",
    code: "IS",
    flag: "🇮🇸",
    dialCode: "+354",
    format: "XXX XXXX",
    maxLength: 7
  },
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    dialCode: "+91",
    format: "XXXXX XXXXX",
    maxLength: 10
  },
  {
    name: "Indonesia",
    code: "ID",
    flag: "🇮🇩",
    dialCode: "+62",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Iran",
    code: "IR",
    flag: "🇮🇷",
    dialCode: "+98",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Ireland",
    code: "IE",
    flag: "🇮🇪",
    dialCode: "+353",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Israel",
    code: "IL",
    flag: "🇮🇱",
    dialCode: "+972",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    dialCode: "+39",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    dialCode: "+81",
    format: "XX XXXX XXXX",
    maxLength: 10
  },
  {
    name: "Latvia",
    code: "LV",
    flag: "🇱🇻",
    dialCode: "+371",
    format: "XX XXX XXX",
    maxLength: 8
  },
  {
    name: "Lithuania",
    code: "LT",
    flag: "🇱🇹",
    dialCode: "+370",
    format: "XXX XXXXX",
    maxLength: 8
  },
  {
    name: "Luxembourg",
    code: "LU",
    flag: "🇱🇺",
    dialCode: "+352",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    dialCode: "+60",
    format: "XX XXXX XXXX",
    maxLength: 10
  },
  {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    dialCode: "+52",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Netherlands",
    code: "NL",
    flag: "🇳🇱",
    dialCode: "+31",
    format: "X XX XX XX XX",
    maxLength: 9
  },
  {
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    dialCode: "+64",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Norway",
    code: "NO",
    flag: "🇳🇴",
    dialCode: "+47",
    format: "XXX XX XXX",
    maxLength: 8
  },
  {
    name: "Pakistan",
    code: "PK",
    flag: "🇵🇰",
    dialCode: "+92",
    format: "XXX XXXXXXX",
    maxLength: 10
  },
  {
    name: "Poland",
    code: "PL",
    flag: "🇵🇱",
    dialCode: "+48",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Portugal",
    code: "PT",
    flag: "🇵🇹",
    dialCode: "+351",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Romania",
    code: "RO",
    flag: "🇷🇴",
    dialCode: "+40",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    flag: "🇸🇦",
    dialCode: "+966",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    dialCode: "+65",
    format: "XXXX XXXX",
    maxLength: 8
  },
  {
    name: "Slovakia",
    code: "SK",
    flag: "🇸🇰",
    dialCode: "+421",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Slovenia",
    code: "SI",
    flag: "🇸🇮",
    dialCode: "+386",
    format: "XX XXX XXX",
    maxLength: 8
  },
  {
    name: "South Africa",
    code: "ZA",
    flag: "🇿🇦",
    dialCode: "+27",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    dialCode: "+82",
    format: "XX XXXX XXXX",
    maxLength: 10
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    dialCode: "+34",
    format: "XXX XXX XXX",
    maxLength: 9
  },
  {
    name: "Sweden",
    code: "SE",
    flag: "🇸🇪",
    dialCode: "+46",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    dialCode: "+41",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    dialCode: "+66",
    format: "X XXXX XXXX",
    maxLength: 9
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "🇹🇷",
    dialCode: "+90",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    dialCode: "+971",
    format: "XX XXX XXXX",
    maxLength: 9
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    dialCode: "+44",
    format: "XXXX XXXXXX",
    maxLength: 10
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    dialCode: "+1",
    format: "XXX XXX XXXX",
    maxLength: 10
  },
  {
    name: "Vietnam",
    code: "VN",
    flag: "🇻🇳",
    dialCode: "+84",
    format: "XXX XXX XXX",
    maxLength: 9
  }
];
const PhoneInput = ({
  value = "",
  onChange,
  countryCode,
  onCountryCodeChange,
  error,
  placeholder = "XXX XXX XX XX",
  label = "Телефон",
  className
}) => {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return countries.find((country) => country.dialCode === (countryCode || "+7")) || countries[0];
  });
  const [countryCodeInput, setCountryCodeInput] = useState(countryCode || "+7");
  const inputRef = useRef(null);
  const codeInputRef = useRef(null);
  useEffect(() => {
    const safeCountryCode = countryCode || "+7";
    const country = countries.find((c) => c.dialCode === safeCountryCode);
    if (country && country.dialCode !== selectedCountry.dialCode) {
      setSelectedCountry(country);
      setCountryCodeInput(country.dialCode);
    }
  }, [countryCode, selectedCountry.dialCode]);
  const formatPhoneNumber = (input, country) => {
    const digitsOnly = input.replace(/\D/g, "");
    const limitedDigits = digitsOnly.substring(0, country.maxLength);
    let formatted = "";
    let digitIndex = 0;
    for (let i = 0; i < country.format.length && digitIndex < limitedDigits.length; i++) {
      if (country.format[i] === "X") {
        formatted += limitedDigits[digitIndex];
        digitIndex++;
      } else {
        formatted += country.format[i];
        if (digitIndex < limitedDigits.length) {
          formatted += " ";
        }
      }
    }
    return formatted.trim();
  };
  const handleInputChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry);
    onChange(formatted);
  };
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCountryCodeInput(country.dialCode);
    onCountryCodeChange(country.dialCode);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleCountryCodeInputChange = (e) => {
    const newCode = e.target.value;
    setCountryCodeInput(newCode);
    const matchingCountry = countries.find((c) => c.dialCode === newCode);
    if (matchingCountry) {
      setSelectedCountry(matchingCountry);
      onCountryCodeChange(matchingCountry.dialCode);
    } else {
      onCountryCodeChange(newCode);
    }
  };
  const handleCountryCodeBlur = () => {
    const matchingCountry = countries.find((c) => c.dialCode === countryCodeInput);
    if (!matchingCountry) {
      setCountryCodeInput(selectedCountry.dialCode);
      onCountryCodeChange(selectedCountry.dialCode);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className, children: [
    label && /* @__PURE__ */ jsxs(Label, { htmlFor: "phone", className: "block text-foreground font-medium mb-2", children: [
      label,
      " ",
      error && /* @__PURE__ */ jsx("span", { className: "text-destructive text-sm", children: "*" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              className: "flex items-center justify-center px-3 py-2 border border-border rounded-l-md h-10",
              children: [
                /* @__PURE__ */ jsx("span", { className: "mr-1", children: selectedCountry.flag }),
                /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 ml-1" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(DropdownMenuContent, { align: "start", className: "max-h-60 overflow-y-auto", children: countries.map((country) => /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              onClick: () => handleCountrySelect(country),
              className: "flex items-center px-4 py-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("span", { className: "mr-2", children: country.flag }),
                /* @__PURE__ */ jsxs("span", { children: [
                  country.name,
                  " (",
                  country.dialCode,
                  ")"
                ] })
              ]
            },
            country.code
          )) })
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            ref: codeInputRef,
            value: countryCodeInput,
            onChange: handleCountryCodeInputChange,
            onBlur: handleCountryCodeBlur,
            className: "w-20 border-l-0 border-r-0 rounded-none h-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "phone",
          ref: inputRef,
          value: value || "",
          onChange: handleInputChange,
          className: cn(
            "w-full rounded-l-none focus:z-10 h-10",
            error && "border-destructive focus:ring-destructive"
          ),
          placeholder,
          "aria-invalid": !!error
        }
      )
    ] }),
    error ? /* @__PURE__ */ jsx("p", { className: "text-destructive text-sm mt-1", children: error }) : /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [
      "Формат: ",
      selectedCountry.format
    ] })
  ] });
};
const PasswordInput = React.forwardRef(
  ({ className, showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          type: showPassword ? "text" : "password",
          className: cn(showPasswordToggle && "pr-10", className),
          ref,
          ...props
        }
      ),
      showPasswordToggle && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: togglePasswordVisibility,
          className: "absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground",
          tabIndex: -1,
          children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4", "aria-hidden": "true" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4", "aria-hidden": "true" })
        }
      )
    ] });
  }
);
PasswordInput.displayName = "PasswordInput";
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";
const baseSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  phone: z.string().min(1, "Телефон обязателен"),
  countryCode: z.string().min(1, "Код страны обязателен"),
  city: z.string().optional().or(z.literal("")),
  comments: z.string().optional()
});
const guestSchema = baseSchema.extend({
  password: z.string().min(6, "Пароль минимум 6 символов"),
  passwordConfirm: z.string().min(1, "Подтвердите пароль")
}).refine((d) => d.password === d.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"]
});
const StepFour = ({
  contactInfo,
  isLoggedIn,
  onBack,
  onSubmit,
  isLoading
}) => {
  const { user } = useAuth();
  const schema = isLoggedIn ? baseSchema : guestSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contactInfo.name || (user == null ? void 0 : user.fullName) || "",
      email: contactInfo.email || (user == null ? void 0 : user.email) || "",
      phone: contactInfo.phone || (user == null ? void 0 : user.phone) || "",
      countryCode: contactInfo.countryCode || (user == null ? void 0 : user.countryCode) || "+7",
      city: contactInfo.city || (user == null ? void 0 : user.city) || "",
      comments: contactInfo.comments || "",
      ...isLoggedIn ? {} : { password: "", passwordConfirm: "" }
    },
    mode: "onBlur"
    // validate as soon as field loses focus
  });
  const handleSubmit = (values) => {
    const data = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      countryCode: values.countryCode,
      city: values.city,
      comments: values.comments
    };
    if (isLoggedIn) {
      onSubmit(data);
    } else {
      const v = values;
      onSubmit(data, v.password, v.passwordConfirm);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "step-container", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-6 text-xl font-medium text-foreground", children: "Контактная информация" }),
    /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "name",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Имя *" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваше имя", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "email",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Email" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваш email", type: "email", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "phone",
            render: () => {
              var _a;
              return /* @__PURE__ */ jsxs(FormItem, { className: "flex-1", children: [
                /* @__PURE__ */ jsx(
                  PhoneInput,
                  {
                    value: form.watch("phone"),
                    onChange: (val) => form.setValue("phone", val, { shouldValidate: true }),
                    countryCode: form.watch("countryCode"),
                    onCountryCodeChange: (cc) => form.setValue("countryCode", cc, {
                      shouldValidate: true
                    }),
                    error: (_a = form.formState.errors.phone) == null ? void 0 : _a.message
                  }
                ),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] });
            }
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "city",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Город" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваш город", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "comments",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { children: "Комментарий к заказу" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              Textarea,
              {
                placeholder: "Дополнительная информация",
                rows: 3,
                className: "resize-none",
                ...field
              }
            ) }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      !isLoggedIn && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-blue-200 bg-blue-50 p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-2 font-medium text-blue-800", children: "Создание аккаунта" }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-blue-700", children: "Создайте пароль для отслеживания заказа." }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "password",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Пароль *" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                  PasswordInput,
                  {
                    placeholder: "Минимум 6 символов",
                    ...field
                  }
                ) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              control: form.control,
              name: "passwordConfirm",
              render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                /* @__PURE__ */ jsx(FormLabel, { children: "Подтверждение пароля *" }),
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(PasswordInput, { placeholder: "Повторите пароль", ...field }) }),
                /* @__PURE__ */ jsx(FormMessage, {})
              ] })
            }
          )
        ] })
      ] }),
      form.formState.errors.root && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx(AlertDescription, { children: form.formState.errors.root.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-between", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onBack, disabled: isLoading, children: "Назад" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "bg-primary text-white hover:bg-primary/90",
            disabled: isLoading,
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Отправка..."
            ] }) : "Отправить заказ"
          }
        )
      ] })
    ] }) })
  ] });
};
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const SuccessModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  return /* @__PURE__ */ jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { className: "items-center text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 p-3", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-10 w-10 text-green-600" }) }),
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl", children: "Заказ успешно отправлен!" }),
      /* @__PURE__ */ jsx(DialogDescription, { className: "text-center pt-2", children: "Мы получили вашу заявку и скоро свяжемся с вами для уточнения деталей." })
    ] }),
    user && /* @__PURE__ */ jsx("div", { className: "bg-blue-50 p-4 rounded-md text-sm text-blue-700 mb-4", children: /* @__PURE__ */ jsx("p", { children: "Вы можете отслеживать статус вашего заказа в личном кабинете. Нажмите кнопку ниже, чтобы перейти к вашим заказам." }) }),
    /* @__PURE__ */ jsx(DialogFooter, { className: "mt-4 flex justify-center", children: /* @__PURE__ */ jsx(
      Button,
      {
        onClick: onClose,
        className: "bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium",
        children: user ? "Перейти в личный кабинет" : "Понятно"
      }
    ) })
  ] }) });
};
const OrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicle: { type: "passenger" },
    parts: [{ name: "", quantity: 1 }],
    contactInfo: {}
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { toast: toast2 } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const submitOrderMutation = useMutation({
    mutationFn: async (payload) => {
      if (user) {
        const res = await apiRequest("POST", "/api/orders", {
          vehicle: payload.vehicle,
          parts: payload.parts,
          contactInfo: payload.contactInfo
        });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/guest-order", {
          vehicle: payload.vehicle,
          parts: payload.parts,
          contactInfo: payload.contactInfo,
          password: payload.password
        });
        return res.json();
      }
    },
    onSuccess: (data) => {
      setIsSuccessModalOpen(true);
      if ((data == null ? void 0 : data.user) && !user) {
        toast2({
          title: "Аккаунт создан",
          description: "Мы создали аккаунт для вас. Теперь вы можете отслеживать заказ в личном кабинете."
        });
      }
    },
    onError: (e) => toast2({
      title: "Ошибка",
      description: e.message || "Не удалось отправить заказ. Попробуйте снова.",
      variant: "destructive"
    })
  });
  const goBack = () => currentStep > 1 && setCurrentStep((s) => s - 1);
  const goForward = () => currentStep < 4 && setCurrentStep((s) => s + 1);
  const mergeData = (delta) => setFormData((prev) => ({ ...prev, ...delta }));
  const submitImmediately = (extra) => {
    const payload = { ...formData, ...extra };
    submitOrderMutation.mutate(payload);
    setFormData(payload);
  };
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return /* @__PURE__ */ jsx(
          StepOne,
          {
            vehicleType: formData.vehicle.type,
            onNext: (type) => {
              mergeData({ vehicle: { ...formData.vehicle, type } });
              goForward();
            }
          }
        );
      case 2:
        return /* @__PURE__ */ jsx(
          StepTwo,
          {
            vehicle: formData.vehicle,
            onBack: goBack,
            onNext: (v) => {
              mergeData({ vehicle: { ...formData.vehicle, ...v } });
              goForward();
            }
          }
        );
      case 3:
        return /* @__PURE__ */ jsx(
          StepThree,
          {
            parts: formData.parts,
            onBack: goBack,
            onNext: (parts) => {
              mergeData({ parts });
              goForward();
            }
          }
        );
      case 4:
        return /* @__PURE__ */ jsx(
          StepFour,
          {
            contactInfo: formData.contactInfo,
            isLoggedIn: !!user,
            onBack: goBack,
            isLoading: submitOrderMutation.isPending,
            onSubmit: (contact, password) => submitImmediately({ contactInfo: contact, password })
          }
        );
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "Оформление заказа" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/",
          className: "flex items-center text-muted-foreground hover:text-secondary",
          children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "mr-1 h-4 w-4",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "2",
                    d: "M10 19l-7-7m0 0l7-7m-7 7h18"
                  }
                )
              }
            ),
            "Вернуться на главную"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(ProgressBar, { currentStep, totalSteps: 4 }),
    renderCurrentStep(),
    /* @__PURE__ */ jsx(
      SuccessModal,
      {
        isOpen: isSuccessModalOpen,
        onClose: () => {
          setIsSuccessModalOpen(false);
          navigate("/dashboard");
        }
      }
    )
  ] }) });
};
const Breadcrumbs = ({ items, className = "mb-8" }) => {
  const breadcrumbListItems = items.map((item) => ({
    "@type": "ListItem",
    "position": item.position,
    "name": item.name,
    ...item.item && { "item": item.item }
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbListItems
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(structuredData) }) }),
    /* @__PURE__ */ jsx("nav", { className, "aria-label": "Breadcrumb", children: /* @__PURE__ */ jsx("ol", { className: "flex flex-wrap items-center space-x-2 text-sm text-gray-500", children: items.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
      index > 0 && /* @__PURE__ */ jsx("span", { className: "mx-2 text-gray-400", children: "/" }),
      item.item ? /* @__PURE__ */ jsx(Link, { href: item.item.replace("https://asiatek.pro", ""), children: /* @__PURE__ */ jsx("span", { className: "hover:text-primary transition-colors cursor-pointer", children: item.name }) }) : /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-800", children: item.name })
    ] }, index)) }) })
  ] });
};
const OrderPage = () => {
  const faqItems = [
    {
      question: "Как заказать запчасти на сайте?",
      answer: "Для заказа запчастей воспользуйтесь формой на этой странице. Укажите информацию о вашем автомобиле, необходимые детали и свои контактные данные. Наши специалисты свяжутся с вами для уточнения деталей заказа."
    },
    {
      question: "Как узнать стоимость запчастей?",
      answer: "После оформления заказа наши менеджеры свяжутся с вами и предоставят информацию о стоимости запчастей, сроках доставки и способах оплаты."
    },
    {
      question: "Какие способы оплаты доступны?",
      answer: "Мы предлагаем различные способы оплаты: банковской картой, банковским переводом, наличными при получении (при доставке курьером или самовывозе)."
    },
    {
      question: "Какие сроки доставки запчастей?",
      answer: "Сроки доставки зависят от наличия запчастей на складе и вашего региона. В среднем, доставка занимает от 1 до 7 рабочих дней. Точные сроки доставки вам сообщит менеджер при подтверждении заказа."
    }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Заказать автозапчасти – быстрая форма заказа – Asiatek",
        description: "Заказать оригинальные и аналоговые запчасти для китайских, коммерческих и легковых автомобилей. Доставка по России. Простая форма заказа.",
        path: "/order"
      }
    ),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-4", children: /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Заказ запчастей", position: 2 }
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(OrderForm, {})
  ] });
};
const formSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  phone: z.string().min(1, "Телефон обязателен"),
  countryCode: z.string().min(1, "Код страны обязателен"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов")
});
const ContactPage = () => {
  const { toast: toast2 } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "+7",
      message: ""
    }
  });
  const contactMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return await res.json();
    },
    onSuccess: () => {
      toast2({
        title: "Сообщение отправлено",
        description: "Мы скоро свяжемся с вами"
      });
      form.reset();
    },
    onError: (error) => {
      toast2({
        title: "Ошибка отправки",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const onSubmit = (data) => {
    contactMutation.mutate(data);
  };
  const faqItems = [
    {
      question: "Как заказать автозапчасти в вашем магазине?",
      answer: "Чтобы заказать автозапчасти, заполните форму заказа на нашем сайте, позвоните по телефону или отправьте заявку через форму обратной связи. Наши специалисты свяжутся с вами для уточнения деталей заказа."
    },
    {
      question: "Какие способы доставки вы предлагаете?",
      answer: "Мы предлагаем доставку по всей России и СНГ. Для отправки используются транспортные компании СДЭК, Деловые Линии, ПЭК и другие. Также возможен самовывоз из нашего офиса в Москве."
    },
    {
      question: "Какие гарантии вы предоставляете на запчасти?",
      answer: "Мы предоставляем гарантию на все запчасти согласно гарантийной политике производителя. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя."
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Контакты – свяжитесь с нами – Asiatek",
        description: "Свяжитесь с нами для заказа запчастей или консультации. Телефон, email и адрес для связи. Быстрая обратная связь гарантирована.",
        path: "/contact"
      }
    ),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems }),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Контакты", position: 2 }
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground mb-8", children: "Связаться с нами" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Заполните форму ниже, и мы свяжемся с вами в ближайшее время. Также вы можете позвонить нам по телефону." }),
          /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "name",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Имя *" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Введите ваше имя", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "email",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Email (необязательно)" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Введите ваш email", type: "email", ...field }) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "phone",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(
                    FormField,
                    {
                      control: form.control,
                      name: "countryCode",
                      render: ({ field: countryField }) => {
                        var _a;
                        return /* @__PURE__ */ jsx(
                          PhoneInput,
                          {
                            value: field.value,
                            onChange: field.onChange,
                            countryCode: countryField.value,
                            onCountryCodeChange: countryField.onChange,
                            error: (_a = form.formState.errors.phone) == null ? void 0 : _a.message
                          }
                        );
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "message",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Сообщение *" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      placeholder: "Опишите ваш вопрос или запрос",
                      className: "resize-none",
                      rows: 4,
                      ...field
                    }
                  ) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                className: "bg-primary hover:bg-primary/90 text-white py-3 px-8 rounded-md font-medium",
                disabled: contactMutation.isPending,
                children: contactMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Отправка..."
                ] }) : "Отправить"
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-md border border-border", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-foreground mb-4", children: "Контактная информация" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Телефон:" }),
              /* @__PURE__ */ jsx("a", { href: "tel:+79802174850", className: "text-secondary hover:underline", children: "+7 980 217-48-50" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Email:" }),
              /* @__PURE__ */ jsx("a", { href: "mailto:asiatek.pro@outlook.com", className: "text-secondary hover:underline", children: "asiatek.pro@outlook.com" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Адрес:" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "г. Москва, 2-й Тушинский проезд 10" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn("flex flex-col gap-2", className),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      // base
      "w-full inline-flex items-center gap-3 justify-start rounded-md px-3 py-2.5",
      "text-sm font-medium text-muted-foreground transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      "disabled:pointer-events-none disabled:opacity-50",
      // states
      "data-[state=active]:bg-blue-50 data-[state=active]:text-secondary",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn("focus-visible:outline-none", className),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Введите пароль"),
  rememberMe: z.boolean().optional()
});
const registerSchema = z.object({
  fullName: z.string().min(1, "Имя обязательно"),
  email: z.string().email("Неверный формат email"),
  phone: z.string().min(1, "Телефон обязателен"),
  countryCode: z.string().min(1, "Код страны обязателен"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  passwordConfirm: z.string().min(1, "Подтвердите пароль")
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"]
});
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      countryCode: "+7",
      password: "",
      passwordConfirm: ""
    }
  });
  const onLoginSubmit = (values) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password
    });
  };
  const onRegisterSubmit = (values) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      phone: values.phone,
      countryCode: values.countryCode,
      city: ""
    });
  };
  if (user) {
    return /* @__PURE__ */ jsx(Redirect, { to: "/dashboard" });
  }
  const faqItems = [
    {
      question: "Как зарегистрироваться на сайте?",
      answer: "Для регистрации на сайте перейдите на страницу авторизации, выберите вкладку 'Регистрация', заполните необходимые поля и нажмите кнопку 'Зарегистрироваться'. После регистрации вы получите доступ к личному кабинету."
    },
    {
      question: "Какие преимущества дает регистрация на сайте?",
      answer: "Регистрация позволяет вам отслеживать статус заказов, сохранять историю заказов для повторных покупок, получать уведомления о статусе заказа, а также делать заказы быстрее и удобнее."
    },
    {
      question: "Что делать, если я забыл пароль?",
      answer: "Если вы забыли пароль, нажмите на ссылку 'Забыли пароль?' на странице входа. Введите свой email, и мы отправим вам инструкции по восстановлению пароля."
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Вход и регистрация – личный кабинет – Asiatek",
        description: "Войдите в личный кабинет или зарегистрируйтесь на сайте Asiatek. Отслеживайте статус заказов, сохраняйте историю и делайте повторные заказы быстрее.",
        path: "/auth"
      }
    ),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems }),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", position: 2 }
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
        Tabs,
        {
          defaultValue: "login",
          value: activeTab,
          onValueChange: setActiveTab,
          className: "w-full",
          children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "flex w-full mb-6 rounded-xl overflow-hidden border border-border", children: [
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "login",
                  className: "flex-1 py-4 rounded-none bg-white data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=inactive]:bg-[#f5f1e9] data-[state=inactive]:text-muted-foreground",
                  children: "Вход"
                }
              ),
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "register",
                  className: "flex-1 py-4 rounded-none bg-white data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=inactive]:bg-[#f5f1e9] data-[state=inactive]:text-muted-foreground",
                  children: "Регистрация"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(TabsContent, { value: "login", children: /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Вход в аккаунт" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Войдите для доступа к личному кабинету и истории заказов" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Form, { ...loginForm, children: /* @__PURE__ */ jsxs("form", { onSubmit: loginForm.handleSubmit(onLoginSubmit), className: "space-y-4", children: [
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: loginForm.control,
                    name: "email",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Email" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваш email", type: "email", ...field }) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: loginForm.control,
                    name: "password",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Пароль" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(PasswordInput, { placeholder: "Ваш пароль", ...field }) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx(
                    FormField,
                    {
                      control: loginForm.control,
                      name: "rememberMe",
                      render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { className: "flex items-center space-x-2 space-y-0", children: [
                        /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                          Checkbox,
                          {
                            checked: field.value,
                            onCheckedChange: field.onChange
                          }
                        ) }),
                        /* @__PURE__ */ jsx(FormLabel, { className: "text-sm font-normal", children: "Запомнить меня" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "link",
                      className: "text-secondary p-0 h-auto",
                      onClick: () => window.location.href = "/auth/forgot-password",
                      children: "Забыли пароль?"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "submit",
                    className: "w-full bg-primary hover:bg-primary/90 text-white",
                    disabled: loginMutation.isPending,
                    children: loginMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                      "Вход..."
                    ] }) : "Войти"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-center mt-4 text-sm text-muted-foreground", children: [
                  "Нет аккаунта?",
                  " ",
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "link",
                      className: "p-0 h-auto text-secondary",
                      onClick: () => setActiveTab("register"),
                      children: "Зарегистрироваться"
                    }
                  )
                ] })
              ] }) }) })
            ] }) }),
            /* @__PURE__ */ jsx(TabsContent, { value: "register", children: /* @__PURE__ */ jsxs(Card, { children: [
              /* @__PURE__ */ jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsx(CardTitle, { children: "Регистрация" }),
                /* @__PURE__ */ jsx(CardDescription, { children: "Создайте аккаунт для заказа запчастей и отслеживания заказов" })
              ] }),
              /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Form, { ...registerForm, children: /* @__PURE__ */ jsxs("form", { onSubmit: registerForm.handleSubmit(onRegisterSubmit), className: "space-y-4", children: [
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: registerForm.control,
                    name: "fullName",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Имя" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваше имя", ...field }) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: registerForm.control,
                    name: "email",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Email" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Ваш email", type: "email", ...field }) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: registerForm.control,
                    name: "phone",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(
                        FormField,
                        {
                          control: registerForm.control,
                          name: "countryCode",
                          render: ({ field: countryField }) => {
                            var _a;
                            return /* @__PURE__ */ jsx(
                              PhoneInput,
                              {
                                value: field.value,
                                onChange: field.onChange,
                                countryCode: countryField.value,
                                onCountryCodeChange: countryField.onChange,
                                error: (_a = registerForm.formState.errors.phone) == null ? void 0 : _a.message
                              }
                            );
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: registerForm.control,
                    name: "password",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Пароль" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                        PasswordInput,
                        {
                          placeholder: "Минимум 6 символов",
                          ...field
                        }
                      ) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormField,
                  {
                    control: registerForm.control,
                    name: "passwordConfirm",
                    render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                      /* @__PURE__ */ jsx(FormLabel, { children: "Подтверждение пароля" }),
                      /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                        PasswordInput,
                        {
                          placeholder: "Повторите пароль",
                          ...field
                        }
                      ) }),
                      /* @__PURE__ */ jsx(FormMessage, {})
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "submit",
                    className: "w-full bg-primary hover:bg-primary/90 text-white",
                    disabled: registerMutation.isPending,
                    children: registerMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                      "Регистрация..."
                    ] }) : "Зарегистрироваться"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-center mt-4 text-sm text-muted-foreground", children: [
                  "Уже есть аккаунт?",
                  " ",
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "link",
                      className: "p-0 h-auto text-secondary",
                      onClick: () => setActiveTab("login"),
                      children: "Войти"
                    }
                  )
                ] })
              ] }) }) })
            ] }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-col justify-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground mb-6", children: "Заказывайте автозапчасти быстро и удобно" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "После регистрации вы сможете:" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-500 mr-2 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
            /* @__PURE__ */ jsx("span", { children: "Делать заказы в несколько кликов" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-500 mr-2 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
            /* @__PURE__ */ jsx("span", { children: "Отслеживать статус ваших заказов" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-500 mr-2 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
            /* @__PURE__ */ jsx("span", { children: "Сохранять историю заказов для повторных покупок" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-500 mr-2 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
            /* @__PURE__ */ jsx("span", { children: "Получать уведомления о статусе заказа" })
          ] })
        ] })
      ] })
    ] })
  ] });
};
const statusLabels = {
  new: { label: "Новый", color: "bg-blue-100 text-blue-800" },
  processing: {
    label: "В обработке",
    color: "bg-yellow-100 text-yellow-800"
  },
  shipped: {
    label: "Отправлен",
    color: "bg-purple-100 text-purple-800"
  },
  delivered: {
    label: "Выполнен",
    color: "bg-green-100 text-green-800"
  },
  cancelled: { label: "Отменен", color: "bg-red-100 text-red-800" }
};
const fmtDate = (d) => new Intl.DateTimeFormat("ru-RU").format(new Date(d));
const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  city: z.string().optional()
});
function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [tab, setTab] = useState("orders");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user
  });
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto w-full max-w-7xl px-4 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-semibold", children: "Личный кабинет" }),
      /* @__PURE__ */ jsx(Link, { href: "/order", children: /* @__PURE__ */ jsx(Button, { className: "w-full sm:w-auto bg-primary hover:bg-primary/90 px-6", children: "Создать новый заказ" }) })
    ] }),
    /* @__PURE__ */ jsxs(
      Tabs,
      {
        value: tab,
        onValueChange: (v) => setTab(v),
        className: "grid gap-6 lg:gap-8 md:grid-cols-[260px_1fr]",
        children: [
          /* @__PURE__ */ jsxs("aside", { className: "rounded-xl border bg-white p-4 md:p-5 shadow-sm", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-6 text-lg font-medium", children: "Меню" }),
            /* @__PURE__ */ jsxs(TabsList, { className: "flex flex-col gap-2 p-0", children: [
              [
                { v: "orders", icon: Package, label: "Мои заказы" },
                { v: "profile", icon: User, label: "Профиль" }
              ].map(({ v, icon: Icon, label }) => /* @__PURE__ */ jsxs(
                TabsTrigger,
                {
                  value: v,
                  className: "w-full flex items-center gap-3 rounded-md px-3 py-2.5\n                           data-[state=active]:bg-blue-50 data-[state=active]:text-secondary",
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 shrink-0" }),
                    label
                  ]
                },
                v
              )),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "ghost",
                  disabled: logoutMutation.isPending,
                  onClick: () => logoutMutation.mutate(),
                  className: "mt-3 flex w-full items-center gap-3 rounded-md\n                         px-3 py-2.5 text-muted-foreground\n                         hover:bg-gray-50 hover:text-secondary",
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5 shrink-0" }),
                    logoutMutation.isPending ? "Выход…" : "Выйти"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mt-4 rounded-xl border bg-white p-5 md:p-6 shadow-sm", children: [
            /* @__PURE__ */ jsx(TabsContent, { value: "orders", forceMount: true, hidden: tab !== "orders", children: /* @__PURE__ */ jsx(Orders, { orders, isLoading }) }),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "profile",
                forceMount: true,
                hidden: tab !== "profile",
                children: /* @__PURE__ */ jsx(UserProfile, { user })
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function Orders({
  orders,
  isLoading
}) {
  if (isLoading) return /* @__PURE__ */ jsx(Spinner, {});
  if (!(orders == null ? void 0 : orders.length))
    return /* @__PURE__ */ jsx(
      Empty,
      {
        msg: "У вас пока нет заказов.",
        link: { to: "/order", label: "Оформите ваш первый заказ" }
      }
    );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-6 text-xl sm:text-2xl font-medium", children: "История заказов" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-5", children: orders.map((o) => {
      const v = o.vehicle || {};
      const parts = o.parts || [];
      return /* @__PURE__ */ jsxs(
        Card,
        {
          className: "overflow-hidden border-border shadow-sm hover:shadow",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 sm:px-5 py-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "Номер заказа: ",
                /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                  "#",
                  o.id
                ] })
              ] }),
              statusLabels[o.status] && /* @__PURE__ */ jsx(
                "span",
                {
                  className: `inline-flex items-center w-auto rounded-full px-2.5 py-1 text-xs font-medium ${statusLabels[o.status].color}`,
                  children: statusLabels[o.status].label
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "p-4 sm:p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-5 mb-4 sm:grid-cols-3", children: [
                /* @__PURE__ */ jsxs(Info, { label: "Автомобиль", children: [
                  v.make || "-",
                  " ",
                  v.model || "",
                  ", ",
                  v.year || "-",
                  v.engineVolume && `, ${v.engineVolume}`
                ] }),
                /* @__PURE__ */ jsx(Info, { label: "Дата заказа", children: fmtDate(o.createdAt) }),
                /* @__PURE__ */ jsx(Info, { label: "Запчасти", children: parts.length ? parts.map((p, i) => /* @__PURE__ */ jsxs("span", { children: [
                  p.name || "Неизвестная деталь",
                  " (",
                  p.quantity || 1,
                  " шт.)",
                  i < parts.length - 1 ? ", " : ""
                ] }, i)) : "Нет информации" })
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "mt-2 flex items-center text-sm text-secondary hover:text-secondary/80", children: [
                "Подробнее ",
                /* @__PURE__ */ jsx(ChevronRight, { className: "ml-1.5 h-4 w-4" })
              ] })
            ] })
          ]
        },
        o.id
      );
    }) })
  ] });
}
const UserProfile = ({
  user
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast: toast2 } = useToast();
  const queryClient2 = useQueryClient();
  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      countryCode: "+7",
      city: ""
    }
  });
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "+7",
        city: user.city || ""
      });
    }
  }, [user, isEditing, form]);
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        phone: data.phone || null,
        city: data.city || null,
        fullName: data.fullName || null,
        countryCode: data.countryCode || "+7"
      };
      const res = await apiRequest(
        "PATCH",
        "/api/user/profile",
        payload
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Ошибка сервера" }));
        throw new Error(err.message || "Unknown error");
      }
      return res.json();
    },
    onSuccess: () => {
      toast2({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены."
      });
      setIsEditing(false);
      queryClient2.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (e) => toast2({
      title: "Ошибка обновления профиля",
      description: e.message,
      variant: "destructive"
    })
  });
  if (!user) return /* @__PURE__ */ jsx(Spinner, {});
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-6 sm:mb-8 text-xl sm:text-2xl font-medium", children: "Данные профиля" }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 rounded-lg border border-border/50 bg-white/50 p-5 sm:p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-x-8 gap-y-5 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Info, { label: "Имя", children: user.fullName || "Не указано" }),
      /* @__PURE__ */ jsx(Info, { label: "Email", children: user.email || "Не указано" }),
      /* @__PURE__ */ jsx(Info, { label: "Телефон", children: user.phone ? `${user.countryCode || ""} ${user.phone}` : "Не указан" }),
      /* @__PURE__ */ jsx(Info, { label: "Город", children: user.city || "Не указан" })
    ] }) }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        className: "bg-primary hover:bg-primary/90 px-5 py-2.5 text-white",
        onClick: () => setIsEditing(true),
        children: [
          /* @__PURE__ */ jsx(Edit, { className: "mr-2.5 h-4 w-4" }),
          "Редактировать профиль"
        ]
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open: isEditing, onOpenChange: setIsEditing, children: /* @__PURE__ */ jsxs(DialogContent, { className: "w-[95%] max-w-md sm:max-w-lg rounded-lg p-5 sm:p-6 shadow-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { className: "mb-2", children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl sm:text-2xl font-medium", children: "Редактирование профиля" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "mt-1.5 text-muted-foreground", children: "Обновите свои контактные данные. Нажмите «Сохранить» для применения изменений." })
      ] }),
      /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: form.handleSubmit(
            (d) => updateProfile.mutate(d)
          ),
          className: "space-y-5 pt-4",
          children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "fullName",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Имя" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      placeholder: "Ваше полное имя",
                      ...field,
                      value: field.value ?? "",
                      className: "focus-visible:ring-primary"
                    }
                  ) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "phone",
                render: ({ field: phoneField }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Телефон" }),
                  /* @__PURE__ */ jsx(
                    FormField,
                    {
                      control: form.control,
                      name: "countryCode",
                      render: ({ field: ccField }) => {
                        var _a;
                        return /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                          PhoneInput,
                          {
                            value: phoneField.value || "",
                            onChange: phoneField.onChange,
                            countryCode: ccField.value || "+7",
                            onCountryCodeChange: ccField.onChange,
                            error: (_a = form.formState.errors.phone) == null ? void 0 : _a.message,
                            className: "focus-visible:ring-primary"
                          }
                        ) });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              FormField,
              {
                control: form.control,
                name: "city",
                render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
                  /* @__PURE__ */ jsx(FormLabel, { children: "Город" }),
                  /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                    Input,
                    {
                      placeholder: "Ваш город",
                      ...field,
                      value: field.value ?? "",
                      className: "focus-visible:ring-primary"
                    }
                  ) }),
                  /* @__PURE__ */ jsx(FormMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(DialogFooter, { className: "mt-6 flex-col gap-3 pt-4 sm:flex-row sm:gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  disabled: updateProfile.isPending,
                  onClick: () => setIsEditing(false),
                  className: "order-2 w-full sm:order-1 sm:w-auto",
                  children: "Отмена"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  disabled: updateProfile.isPending || !form.formState.isDirty,
                  className: "order-1 w-full bg-primary text-white hover:bg-primary/90 sm:order-2 sm:w-auto",
                  children: updateProfile.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Сохранение…"
                  ] }) : "Сохранить"
                }
              )
            ] })
          ]
        }
      ) })
    ] }) })
  ] });
};
const Spinner = () => /* @__PURE__ */ jsx("div", { className: "flex h-40 items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
const Empty = ({
  msg,
  link
}) => /* @__PURE__ */ jsxs("div", { className: "py-8 text-center", children: [
  /* @__PURE__ */ jsx("h2", { className: "mb-6 text-xl font-medium", children: "История заказов" }),
  /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
    msg,
    " ",
    /* @__PURE__ */ jsx(Link, { href: link.to, className: "text-secondary hover:underline", children: link.label })
  ] })
] });
const Info = ({
  label,
  children
}) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: label }),
  /* @__PURE__ */ jsx("p", { className: "text-sm", children })
] });
const forgotPasswordSchema = z.object({
  email: z.string().email("Неверный формат email")
});
const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [, navigate] = useLocation();
  const { toast: toast2 } = useToast();
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      return await res.json();
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error) => {
      toast2({
        title: "Ошибка",
        description: error.message || "Не удалось отправить ссылку для сброса пароля. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    }
  });
  const onSubmit = (values) => {
    forgotPasswordMutation.mutate(values);
  };
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Восстановление пароля – Asiatek",
        description: "Восстановление доступа к личному кабинету на сайте Asiatek. Введите ваш email для получения инструкций по сбросу пароля.",
        path: "/auth/forgot-password",
        noindex: true
      }
    ),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", item: "https://asiatek.pro/auth", position: 2 },
          { name: "Восстановление пароля", position: 3 }
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ jsxs(Card, { className: "border-border", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Восстановление пароля" }),
        /* @__PURE__ */ jsx(CardDescription, { children: emailSent ? "Проверьте вашу электронную почту" : "Введите ваш email для восстановления пароля" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: emailSent ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Alert, { className: "mb-6 bg-green-50 border-green-200", children: [
          /* @__PURE__ */ jsx(AlertTitle, { children: "Письмо отправлено" }),
          /* @__PURE__ */ jsx(AlertDescription, { children: "Мы отправили инструкции по сбросу пароля на указанный email. Пожалуйста, проверьте вашу почту (включая папку спам) и следуйте инструкциям в письме." })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            className: "w-full bg-primary hover:bg-primary/90 text-white",
            onClick: () => navigate("/auth"),
            children: "Вернуться на страницу входа"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "email",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Email" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                Input,
                {
                  placeholder: "Ваш email",
                  type: "email",
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full bg-primary hover:bg-primary/90 text-white mt-2",
            disabled: forgotPasswordMutation.isPending,
            children: forgotPasswordMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Отправка..."
            ] }) : "Отправить ссылку для сброса"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "link",
            className: "text-secondary p-0 h-auto",
            onClick: () => navigate("/auth"),
            children: "Вернуться на страницу входа"
          }
        ) })
      ] }) }) })
    ] }) })
  ] });
};
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  passwordConfirm: z.string().min(1, "Подтвердите пароль")
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Пароли не совпадают",
  path: ["passwordConfirm"]
});
const ResetPasswordPage = () => {
  useLocation();
  const [token, setToken] = useState(null);
  const [tokenVerified, setTokenVerified] = useState(null);
  const [, navigate] = useLocation();
  const { toast: toast2 } = useToast();
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    setToken(tokenParam);
    if (tokenParam) {
      verifyTokenMutation.mutate(tokenParam);
    }
  }, []);
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: ""
    }
  });
  const verifyTokenMutation = useMutation({
    mutationFn: async (token2) => {
      const res = await apiRequest("POST", "/api/verify-reset-token", { token: token2 });
      return await res.json();
    },
    onSuccess: () => {
      setTokenVerified(true);
    },
    onError: () => {
      setTokenVerified(false);
    }
  });
  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast2({
        title: "Пароль обновлен",
        description: "Ваш пароль был успешно изменен. Теперь вы можете войти в систему."
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2e3);
    },
    onError: (error) => {
      toast2({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пароль. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    }
  });
  const onSubmit = (values) => {
    if (token) {
      resetPasswordMutation.mutate({
        ...values,
        token
      });
    }
  };
  if (token === null && tokenVerified !== null) {
    return /* @__PURE__ */ jsx(Redirect, { to: "/auth" });
  }
  if (tokenVerified === null) {
    return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
      /* @__PURE__ */ jsx(
        Seo,
        {
          title: "Проверка ссылки сброса пароля – Asiatek",
          description: "Проверка ссылки для сброса пароля на сайте Asiatek.",
          path: "/auth/reset-password",
          noindex: true
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground", children: "Проверка ссылки для сброса пароля..." })
      ] }) }) })
    ] });
  }
  if (tokenVerified === false) {
    return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
      /* @__PURE__ */ jsx(
        Seo,
        {
          title: "Ошибка сброса пароля – Asiatek",
          description: "Ссылка для сброса пароля недействительна или истекла.",
          path: "/auth/reset-password",
          noindex: true
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ jsxs(Card, { className: "border-border", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Ошибка сброса пароля" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Ссылка для сброса пароля недействительна или истекла" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs(Alert, { variant: "destructive", className: "mb-6", children: [
            /* @__PURE__ */ jsx(AlertTitle, { children: "Недействительная ссылка" }),
            /* @__PURE__ */ jsx(AlertDescription, { children: "Ссылка для сброса пароля, которую вы использовали, недействительна или истекла. Пожалуйста, запросите новую ссылку для сброса пароля." })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              className: "w-full bg-primary hover:bg-primary/90 text-white",
              onClick: () => navigate("/auth"),
              children: "Вернуться на страницу входа"
            }
          )
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Сброс пароля – Asiatek",
        description: "Сброс пароля на сайте Asiatek. Введите новый пароль для вашей учетной записи.",
        path: "/auth/reset-password",
        noindex: true
      }
    ),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Авторизация", item: "https://asiatek.pro/auth", position: 2 },
          { name: "Сброс пароля", position: 3 }
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ jsxs(Card, { className: "border-border", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Сброс пароля" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Пожалуйста, введите новый пароль для вашей учетной записи" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "password",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Новый пароль" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                PasswordInput,
                {
                  placeholder: "Минимум 6 символов",
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "passwordConfirm",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Подтверждение пароля" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
                PasswordInput,
                {
                  placeholder: "Повторите пароль",
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full bg-primary hover:bg-primary/90 text-white mt-2",
            disabled: resetPasswordMutation.isPending,
            children: resetPasswordMutation.isPending ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Обновление пароля..."
            ] }) : "Обновить пароль"
          }
        )
      ] }) }) })
    ] }) })
  ] });
};
const chineseBrands = [
  {
    slug: "sitrak",
    name: "sitrak",
    fullName: "Sitrak (Ситрак)",
    description: "Sitrak - это бренд коммерческих грузовиков, созданный совместным предприятием между немецким MAN и китайским Sinotruk. Мы предлагаем широкий ассортимент оригинальных и аналоговых запчастей для грузовиков Sitrak всех моделей.",
    models: ["C7H", "T7H", "A7H"],
    logoSrc: "/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_41_05 PM.png",
    category: "chinese"
  },
  {
    slug: "howo",
    name: "howo",
    fullName: "HOWO (Хово)",
    description: "HOWO - известный китайский бренд грузовых автомобилей, принадлежащий корпорации Sinotruk. Мы поставляем качественные оригинальные и аналоговые запчасти для всех моделей грузовиков HOWO.",
    models: ["A7", "T5G", "T7H"],
    logoSrc: "/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_42_46 PM.png",
    category: "chinese"
  },
  {
    slug: "shacman",
    name: "shacman",
    fullName: "Shacman (Шакман)",
    description: "Shacman - один из ведущих китайских производителей грузовых автомобилей. Наша компания предлагает полный ассортимент запчастей для грузовиков Shacman всех моделей и годов выпуска.",
    models: ["X3000", "F2000", "F3000", "H3000"],
    category: "chinese"
  },
  {
    slug: "sinotruk",
    name: "sinotruk",
    fullName: "Sinotruk (Синотрак)",
    description: "Sinotruk - крупный китайский производитель грузовых автомобилей. Мы предлагаем широкий выбор запчастей для всех моделей грузовиков Sinotruk, включая оригинальные детали и качественные аналоги.",
    models: ["HOWO", "HOHAN", "SITRAK"],
    category: "chinese"
  },
  {
    slug: "faw",
    name: "faw",
    fullName: "FAW (ФАВ)",
    description: "FAW - одна из старейших и крупнейших автомобилестроительных компаний Китая. В нашем каталоге представлены оригинальные и аналоговые запчасти для всех моделей грузовиков FAW.",
    models: ["J6", "Tiger V", "Jiefang"],
    category: "chinese"
  },
  {
    slug: "dongfeng",
    name: "dongfeng",
    fullName: "Dongfeng (Донгфенг)",
    description: "Dongfeng - один из ведущих производителей коммерческого транспорта в Китае. Мы предлагаем полный спектр запчастей для грузовиков Dongfeng всех модификаций.",
    models: ["KL", "KR", "DFL"],
    category: "chinese"
  }
];
const commercialBrands = [
  {
    slug: "mercedes",
    name: "mercedes",
    fullName: "Mercedes-Benz Trucks",
    description: "Mercedes-Benz Trucks - подразделение Daimler AG, производящее грузовые автомобили премиум-класса. Мы поставляем оригинальные и аналоговые запчасти для грузовиков Mercedes-Benz всех моделей.",
    models: ["Actros", "Arocs", "Atego", "Axor"],
    category: "commercial"
  },
  {
    slug: "volvo",
    name: "volvo",
    fullName: "Volvo Trucks",
    description: "Volvo Trucks - шведский производитель грузовых автомобилей, известный своей безопасностью и надежностью. В нашем ассортименте представлены запчасти для всех серий грузовиков Volvo.",
    models: ["FH", "FM", "FMX", "FE", "FL"],
    category: "commercial"
  },
  {
    slug: "scania",
    name: "scania",
    fullName: "Scania",
    description: "Scania - шведский производитель тяжелых грузовых автомобилей и автобусов. Мы предлагаем широкий выбор запчастей для грузовиков Scania всех серий и поколений.",
    models: ["R-series", "S-series", "G-series", "P-series"],
    category: "commercial"
  },
  {
    slug: "man",
    name: "man",
    fullName: "MAN Truck & Bus",
    description: "MAN - немецкий производитель коммерческих автомобилей, входящий в группу Volkswagen AG. Наша компания поставляет запчасти для всех моделей грузовиков MAN.",
    models: ["TGX", "TGS", "TGM", "TGL"],
    category: "commercial"
  }
];
const passengerBrands = [
  {
    slug: "bmw",
    name: "bmw",
    fullName: "BMW",
    description: "BMW - немецкий производитель премиальных автомобилей и мотоциклов. Мы предлагаем оригинальные и аналоговые запчасти для всех моделей BMW.",
    models: ["3 Series", "5 Series", "7 Series", "X5", "X7"],
    category: "passenger"
  },
  {
    slug: "toyota",
    name: "toyota",
    fullName: "Toyota",
    description: "Toyota - японский автопроизводитель, известный своей надежностью и долговечностью. В нашем каталоге представлены запчасти для всех популярных моделей Toyota.",
    models: ["Camry", "Corolla", "Land Cruiser", "RAV4", "Prado"],
    category: "passenger"
  },
  {
    slug: "kia",
    name: "kia",
    fullName: "Kia",
    description: "Kia - южнокорейский производитель автомобилей с широкой линейкой моделей. Мы поставляем запчасти для всех современных моделей Kia.",
    models: ["Rio", "Sportage", "Sorento", "Cerato", "K5"],
    category: "passenger"
  },
  {
    slug: "hyundai",
    name: "hyundai",
    fullName: "Hyundai",
    description: "Hyundai - южнокорейский автопроизводитель с обширной линейкой автомобилей. В нашем ассортименте представлены запчасти для всех популярных моделей Hyundai.",
    models: ["Solaris", "Creta", "Santa Fe", "Tucson", "Elantra"],
    category: "passenger"
  }
];
const allBrands = [
  ...chineseBrands,
  ...commercialBrands,
  ...passengerBrands
];
function getBrandBySlug(slug) {
  return allBrands.find((brand) => brand.slug === slug);
}
const formatBrandName$1 = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
const ZapchastiIndexPage = () => {
  const faqItems = [
    {
      question: "Какие марки автомобилей вы обслуживаете?",
      answer: "Мы предлагаем запчасти для широкого спектра автомобилей, включая китайские грузовики (Geely, Chery, Haval, Great Wall), европейские грузовики (Isuzu, Hino, Mitsubishi Fuso) и легковые автомобили (Toyota, Nissan, Honda, Mitsubishi, Mazda)."
    },
    {
      question: "Вы продаете оригинальные запчасти или аналоги?",
      answer: "Мы предлагаем как оригинальные запчасти от производителей автомобилей, так и качественные аналоги от проверенных поставщиков. При оформлении заказа вы можете указать свои предпочтения."
    },
    {
      question: "Как определить нужную мне запчасть?",
      answer: "Для определения нужной запчасти вы можете использовать каталог на нашем сайте, выбрав марку и модель вашего автомобиля. Также вы можете указать VIN-номер вашего автомобиля при заказе, и наши специалисты помогут подобрать необходимые детали."
    },
    {
      question: "Сколько времени занимает доставка запчастей?",
      answer: "Сроки доставки зависят от наличия запчастей на складе и вашего региона. В среднем, доставка по Москве занимает 1-2 дня, по России – от 3 до 10 дней в зависимости от удаленности региона."
    },
    {
      question: "Предоставляете ли вы гарантию на запчасти?",
      answer: "Да, мы предоставляем гарантию на все запчасти. На оригинальные запчасти гарантия составляет от 6 до 12 месяцев, на аналоговые – от 1 до 6 месяцев в зависимости от производителя."
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: "Каталог запчастей для грузовых и легковых автомобилей – Asiatek",
        description: "Широкий выбор запчастей для китайских, европейских грузовых и легковых автомобилей. Оригинальные и аналоговые запчасти с доставкой по всей России и СНГ.",
        path: "/zapchasti"
      }
    ),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems }),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Запчасти", position: 2 }
        ]
      }
    ),
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-10 text-center md:text-left", children: "Каталог запчастей" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6 border-b pb-2", children: "Запчасти для китайских грузовиков" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: chineseBrands.map((brand) => /* @__PURE__ */ jsx(Link, { href: `/zapchasti/${brand.slug}`, children: /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4 h-24", children: brand.logoSrc ? /* @__PURE__ */ jsx(
          "img",
          {
            src: brand.logoSrc,
            alt: `Логотип ${formatBrandName$1(brand.name)} запчасти`,
            className: "h-full object-contain"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: brand.name.slice(0, 2).toUpperCase() }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-center", children: formatBrandName$1(brand.name) }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-500 mt-2 text-sm", children: [
          "Запчасти для ",
          brand.fullName || formatBrandName$1(brand.name)
        ] })
      ] }) }, brand.slug)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6 border-b pb-2", children: "Запчасти для европейских грузовиков" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: commercialBrands.map((brand) => /* @__PURE__ */ jsx(Link, { href: `/zapchasti/${brand.slug}`, children: /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4 h-24", children: brand.logoSrc ? /* @__PURE__ */ jsx(
          "img",
          {
            src: brand.logoSrc,
            alt: `Логотип ${formatBrandName$1(brand.name)} запчасти`,
            className: "h-full object-contain"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: brand.name.slice(0, 2).toUpperCase() }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-center", children: formatBrandName$1(brand.name) }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-500 mt-2 text-sm", children: [
          "Запчасти для ",
          brand.fullName || formatBrandName$1(brand.name)
        ] })
      ] }) }, brand.slug)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6 border-b pb-2", children: "Запчасти для легковых автомобилей" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: passengerBrands.map((brand) => /* @__PURE__ */ jsx(Link, { href: `/zapchasti/${brand.slug}`, children: /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4 h-24", children: brand.logoSrc ? /* @__PURE__ */ jsx(
          "img",
          {
            src: brand.logoSrc,
            alt: `Логотип ${formatBrandName$1(brand.name)} запчасти`,
            className: "h-full object-contain"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: brand.name.slice(0, 2).toUpperCase() }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-center", children: formatBrandName$1(brand.name) }),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-500 mt-2 text-sm", children: [
          "Запчасти для ",
          brand.fullName || formatBrandName$1(brand.name)
        ] })
      ] }) }, brand.slug)) })
    ] })
  ] });
};
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
function ProductLD(p) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "brand": p.brand,
    "url": p.id,
    "image": p.image
  };
  if (p.price) ld.offers = {
    "@type": "Offer",
    "priceCurrency": "TJS",
    "price": p.price,
    "availability": "https://schema.org/InStock"
  };
  if (p.rating) ld.aggregateRating = {
    "@type": "AggregateRating",
    "ratingValue": p.rating.toFixed(1),
    "reviewCount": p.reviewCount ?? 1
  };
  return /* @__PURE__ */ jsx(Helmet$1, { children: /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(ld) }) });
}
const formatBrandName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
const BrandPage = ({ brand }) => {
  const displayName = formatBrandName(brand.name);
  const fullBrandName = brand.fullName || displayName;
  const exampleParts = [
    {
      sku: "P001",
      name: "Тормозные колодки",
      image: "https://asiatek.pro/assets/brake-pads.jpg",
      price: 1200,
      avgRating: 4.7,
      reviewCount: 12
    },
    {
      sku: "P002",
      name: "Масляный фильтр",
      image: "https://asiatek.pro/assets/oil-filter.jpg",
      price: 450,
      avgRating: 4.5,
      reviewCount: 8
    },
    {
      sku: "P003",
      name: "Амортизатор передний",
      image: "https://asiatek.pro/assets/shock-absorber.jpg",
      price: 3500,
      avgRating: 4.9,
      reviewCount: 15
    }
  ];
  const faqItems = [
    {
      question: `Как узнать номер детали ${displayName}?`,
      answer: `Номер детали ${displayName} можно найти в каталоге запчастей, на шильдике оригинальной детали, или связавшись с нашими специалистами, которые помогут определить нужную деталь по VIN номеру автомобиля.`
    },
    {
      question: `Сколько стоят запчасти для ${displayName}?`,
      answer: `Стоимость запчастей ${displayName} зависит от конкретной детали, её оригинальности и наличия. Оставьте заявку, и наши менеджеры предоставят вам детальную информацию по ценам.`
    },
    {
      question: `Как заказать запчасти ${displayName}?`,
      answer: `Чтобы заказать запчасти ${displayName}, воспользуйтесь формой заказа на нашем сайте, позвоните нам или напишите в чат. Мы поможем подобрать необходимые детали по vin-коду автомобиля.`
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx(
      Seo,
      {
        title: `Запчасти для ${displayName} – Asiatek`,
        description: `Купить оригинальные и аналоговые запчасти для ${fullBrandName}. Широкий ассортимент, гарантия качества. Доставка по СНГ.`,
        path: `/zapchasti/${brand.slug}`,
        brand: displayName,
        type: "product"
      }
    ),
    /* @__PURE__ */ jsx(
      Breadcrumbs,
      {
        items: [
          { name: "Главная", item: "https://asiatek.pro", position: 1 },
          { name: "Запчасти", item: "https://asiatek.pro/zapchasti", position: 2 },
          { name: displayName.toUpperCase(), position: 3 }
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-bold mb-6", children: [
          "Запчасти для ",
          displayName
        ] }),
        /* @__PURE__ */ jsx("div", { className: "prose max-w-none mb-8", children: /* @__PURE__ */ jsx("p", { className: "text-lg", children: brand.description }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
            "Оригинальные и аналоговые запчасти ",
            fullBrandName
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-4", children: [
            "В нашем каталоге представлен широкий ассортимент оригинальных и аналоговых запчастей для автомобилей ",
            displayName,
            ". Мы предлагаем только качественные запчасти от проверенных поставщиков."
          ] })
        ] }),
        brand.models && brand.models.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
            "Каталог деталей ",
            displayName,
            " ",
            brand.models.join(", ")
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-4", children: [
            "У нас вы найдете запчасти для различных моделей ",
            displayName,
            ": ",
            brand.models.join(", "),
            ". Наши специалисты помогут вам подобрать необходимые детали по VIN-коду вашего автомобиля."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6", children: brand.models.map((model, index) => /* @__PURE__ */ jsx(Link, { href: `/zapchasti/${brand.slug}/${model.toLowerCase()}`, children: /* @__PURE__ */ jsxs("div", { className: "border p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-medium", children: [
              displayName,
              " ",
              model
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Запчасти и комплектующие" })
          ] }) }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
            "Популярные запчасти ",
            displayName
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: exampleParts.map((part) => /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-4 hover:shadow-md transition", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: part.image,
                alt: `${part.name} для ${displayName}`,
                className: "w-full h-48 object-contain mb-3"
              }
            ),
            /* @__PURE__ */ jsxs("h3", { className: "font-medium text-lg", children: [
              part.name,
              " для ",
              displayName
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-lg", children: [
                part.price,
                " ₽"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-amber-500", children: "★" }),
                /* @__PURE__ */ jsx("span", { className: "ml-1", children: part.avgRating })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Link, { href: `/zapchasti/${brand.slug}/${part.sku.toLowerCase()}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Подробнее" }) }),
            /* @__PURE__ */ jsx(
              ProductLD,
              {
                id: `https://asiatek.pro/zapchasti/${brand.slug}/${part.sku.toLowerCase()}`,
                name: `${part.name} для ${displayName}`,
                brand: displayName,
                image: part.image,
                price: part.price,
                rating: part.avgRating,
                reviewCount: part.reviewCount
              }
            )
          ] }, part.sku)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
            "Как заказать запчасти ",
            displayName,
            " в Душанбе / Москве"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-4", children: [
            "Чтобы заказать запчасти ",
            displayName,
            ", просто оставьте заявку на нашем сайте или свяжитесь с нами по телефону. Наши специалисты помогут вам подобрать необходимые детали и оформить заказ."
          ] }),
          /* @__PURE__ */ jsx(Link, { href: "/order", children: /* @__PURE__ */ jsx(Button, { className: "mt-4", size: "lg", children: "Оставить заявку" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "Часто задаваемые вопросы" }),
          /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: faqItems.map((item, index) => /* @__PURE__ */ jsxs(AccordionItem, { value: `item-${index}`, children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { children: item.question }),
            /* @__PURE__ */ jsx(AccordionContent, { children: item.answer })
          ] }, index)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg sticky top-24", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: brand.logoSrc ? /* @__PURE__ */ jsx(
          "img",
          {
            src: brand.logoSrc,
            alt: `Логотип ${displayName} запчасти`,
            className: "h-32 object-contain"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: displayName.slice(0, 2).toUpperCase() }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-4 text-center", children: displayName }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6 text-center", children: [
          "Оригинальные и аналоговые запчасти для автомобилей ",
          displayName
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Link, { href: "/order", children: /* @__PURE__ */ jsx(Button, { className: "w-full", size: "lg", children: "Заказать запчасти" }) }),
          /* @__PURE__ */ jsx(Link, { href: "/contact", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Консультация специалиста" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(FAQ, { items: faqItems })
  ] });
};
function NotFound() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsx(Card, { className: "w-full max-w-md mx-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex mb-4 gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-8 w-8 text-red-500" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "404 Page Not Found" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-gray-600", children: "Did you forget to add the page to the router?" })
  ] }) }) });
}
const ZapchastiPage = () => {
  const [match, params] = useRoute("/zapchasti/:brand");
  if (!match) {
    return /* @__PURE__ */ jsx(NotFound, {});
  }
  const brand = getBrandBySlug(params.brand);
  if (!brand) {
    return /* @__PURE__ */ jsx(NotFound, {});
  }
  return /* @__PURE__ */ jsx(BrandPage, { brand });
};
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  const handleLogout = () => {
    logoutMutation.mutate();
    closeMenu();
  };
  const isActiveLink = (path) => {
    return location === path ? "text-secondary" : "text-foreground hover:text-secondary";
  };
  return /* @__PURE__ */ jsxs("header", { className: "border-b border-border", children: [
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto py-3 px-[20px] flex justify-between items-center", style: { maxWidth: "1328px", height: "48px" }, children: [
      /* @__PURE__ */ jsx(Link, { href: "/", className: "text-secondary font-medium text-xl flex items-center", children: /* @__PURE__ */ jsx("img", { src: "/assets/logos/Mask group_1743630919201.png", alt: "Asiatek Logo", className: "h-8" }) }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center space-x-[30px]", children: [
        /* @__PURE__ */ jsx(Link, { href: "/", className: `${isActiveLink("/")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`, children: "Главное" }),
        /* @__PURE__ */ jsx(Link, { href: "/order", className: `${isActiveLink("/order")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`, children: "Запчасти" }),
        /* @__PURE__ */ jsx(Link, { href: "/contact", className: `${isActiveLink("/contact")} transition uppercase font-['Roboto_Condensed'] px-[18px] py-[18px]`, children: "Связаться с нами" }),
        user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: `${isActiveLink("/dashboard")} transition uppercase font-['Roboto_Condensed']`, children: "Личный кабинет" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              className: "uppercase font-['Roboto_Condensed']",
              onClick: handleLogout,
              disabled: logoutMutation.isPending,
              children: "Выйти"
            }
          )
        ] }) : /* @__PURE__ */ jsx(Link, { href: "/auth", className: `${isActiveLink("/auth")} transition uppercase font-['Roboto_Condensed']`, children: "Войти / Зарегистрироваться" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "md:hidden text-foreground",
          onClick: toggleMenu,
          "aria-label": isMenuOpen ? "Закрыть меню" : "Открыть меню",
          children: isMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Menu, { className: "w-6 h-6" })
        }
      )
    ] }),
    isMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 space-y-1", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/",
          className: "block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
          onClick: closeMenu,
          children: "ГЛАВНОЕ"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/order",
          className: "block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
          onClick: closeMenu,
          children: "ЗАПЧАСТИ"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/contact",
          className: "block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
          onClick: closeMenu,
          children: "СВЯЗАТЬСЯ С НАМИ"
        }
      ),
      user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/dashboard",
            className: "block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
            onClick: closeMenu,
            children: "ЛИЧНЫЙ КАБИНЕТ"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "block w-full text-left px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
            onClick: handleLogout,
            disabled: logoutMutation.isPending,
            children: "ВЫЙТИ"
          }
        )
      ] }) : /* @__PURE__ */ jsx(
        Link,
        {
          href: "/auth",
          className: "block px-3 py-2 text-foreground hover:bg-border rounded font-['Roboto_Condensed']",
          onClick: closeMenu,
          children: "ВОЙТИ / ЗАРЕГИСТРИРОВАТЬСЯ"
        }
      )
    ] }) })
  ] });
};
const logo = "/assets/Mask%20group_1743630919201-DFtwgsdM.png";
const Footer = () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx("footer", { className: "bg-white border-t border-border mt-auto", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
        /* @__PURE__ */ jsxs(Link, { href: "/", className: "text-secondary font-medium flex items-center justify-center md:justify-start", children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "Asiatek Logo", className: "h-8 mr-2" }),
          /* @__PURE__ */ jsx("span", { className: "font-['Roboto_Condensed']", children: "Asiatek" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mt-3", children: "Ваш надежный поставщик автозапчастей для легковых и коммерческих автомобилей" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4 font-['Roboto_Condensed']", children: "Навигация" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/", className: "text-muted-foreground hover:text-secondary transition", children: "Главное" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/order", className: "text-muted-foreground hover:text-secondary transition", children: "Запчасти" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/contact", className: "text-muted-foreground hover:text-secondary transition", children: "Связаться с нами" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/auth", className: "text-muted-foreground hover:text-secondary transition", children: "Личный кабинет" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4 font-['Roboto_Condensed']", children: "Контакты" }),
        /* @__PURE__ */ jsxs("section", { className: "text-muted-foreground text-sm leading-relaxed", children: [
          /* @__PURE__ */ jsx("strong", { children: "Asiatek" }),
          /* @__PURE__ */ jsx("br", {}),
          "пр‑т Рудаки 21, Душанбе 734000",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("a", { href: "tel:+992931234567", className: "hover:text-secondary transition", children: "+992 93 123‑4567" }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "mt-2 block", children: "Email: asiatek.pro@outlook.com" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4 font-['Roboto_Condensed']", children: "Социальные сети" }),
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-4", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.instagram.com/asiatek.tj",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-secondary transition",
              children: /* @__PURE__ */ jsx(FaInstagram, { size: 24 })
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://t.me/asiatekbot",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-secondary transition",
              children: /* @__PURE__ */ jsx(FaTelegram, { size: 24 })
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://wa.me/message/FSP6ZQKJMRVCC1",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-secondary transition",
              children: /* @__PURE__ */ jsx(FaWhatsapp, { size: 24 })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-border mt-8 pt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
      "© ",
      currentYear,
      " Asiatek. Все права защищены."
    ] }) })
  ] }) });
};
function Router() {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-grow", children: /* @__PURE__ */ jsxs(Switch, { children: [
      /* @__PURE__ */ jsx(Route, { path: "/", component: HomePage }),
      /* @__PURE__ */ jsx(Route, { path: "/order", component: OrderPage }),
      /* @__PURE__ */ jsx(Route, { path: "/contact", component: ContactPage }),
      /* @__PURE__ */ jsx(Route, { path: "/auth", component: AuthPage }),
      /* @__PURE__ */ jsx(Route, { path: "/auth/forgot-password", component: ForgotPasswordPage }),
      /* @__PURE__ */ jsx(Route, { path: "/auth/reset-password", component: ResetPasswordPage }),
      /* @__PURE__ */ jsx(ProtectedRoute, { path: "/dashboard", component: DashboardPage }),
      /* @__PURE__ */ jsx(Route, { path: "/zapchasti", component: ZapchastiIndexPage }),
      /* @__PURE__ */ jsx(Route, { path: "/zapchasti/:brand", component: ZapchastiPage }),
      /* @__PURE__ */ jsx(Route, { component: NotFound })
    ] }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Router, {}),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(PWAInstallPrompt, {}),
    " ",
    /* @__PURE__ */ jsx(LocalBusinessLD, {})
  ] }) }) });
}
if (typeof window !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const queryClient2 = new QueryClient();
    createRoot(container).render(
      /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient2, children: /* @__PURE__ */ jsx(App, {}) }) })
    );
  }
}
function ClientApp() {
  const queryClient2 = new QueryClient();
  return /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient2, children: /* @__PURE__ */ jsx(App, {}) }) });
}
export {
  ClientApp as default
};
