import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { UsePathLookupHook } from "./lookup-provider";

export interface BreadcrumbItemProps {
  name: string;
  href: string;
}
interface BreadcrumbOptions {
  title?: string;
  [key: string]: any; // Add any additional options as key-value pairs
}

interface BreadcrumbLookupHandlers {
  path: string;
  options?: BreadcrumbOptions;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbLookupHandlers[];
  setPath: (path: string) => void;
  items: BreadcrumbItemProps[];
  getDropdownHandler: (path: string) => React.ReactNode | null;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export const useBreadcrumbContext = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error(
      "useBreadcrumbContext must be used within a BreadcrumbProvider"
    );
  }
  return context;
};

interface BreadcrumbProviderProps {
  children: ReactNode;
  lookupHandlers: UsePathLookupHook[];
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({
  children,
  lookupHandlers,
}) => {
  const [providers, setproviders] = useState<UsePathLookupHook[]>([]);
  const [items, setitems] = useState<BreadcrumbItemProps[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbLookupHandlers[]>(
    []
  );

  const registerBreadcrumbLookupProvider = useCallback(
    (path: string, options: BreadcrumbOptions = {}) => {
      setBreadcrumbs((prevBreadcrumbs) => {
        const existing = prevBreadcrumbs.find((b) => b.path === path);
        if (existing) {
          return prevBreadcrumbs.map((b) =>
            b.path === path ? { path, options } : b
          );
        }
        return [...prevBreadcrumbs, { path, options }];
      });
    },
    []
  );

  const setPath = useCallback((pathname: string) => {
    const path = pathname.split("/").filter(Boolean);

    const items = path.map((_, i) => {
      const href = "/" + path.slice(0, i + 1).join("/");
      return {
        name: path[i],
        href,
      };
    });
    setitems(items);
  }, []);

  const getDropdownHandler = (path: string) => {
    const handler = lookupHandlers.find((provider) => {
      return provider.match(path);
    });
    return handler?.lookup;
  };

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        setPath,
        items,
        getDropdownHandler,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};
