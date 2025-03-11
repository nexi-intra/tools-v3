"use client";
import { IPublicClientApplication } from "@azure/msal-browser";

import { createContext } from "react";
import { Result } from "./httphelper";
import { UserProfile } from '@prisma/client';
export interface Session {
  user: User;
  expires: string;
  roles: string[];
  accessToken: string;
}

export type appModeTypes = "normal" | "iframed" | "app"
export interface User {
  name: string;
  email: string;
  image: string;
  id: string;
  roles: string[];
}
export type ServiceCallLogEntry = {
  transactionId: string;
  calledTimestamp: Date;
  responedTimestamp: Date;

  servicename: string;
  response: Result<any>;
};
export type AuthSource = "MSAL" | "SharePoint" | "";
export type MagicboxContextType = {
  userProfile: UserProfile | null;
  session?: Session;
  version: number;
  user?: User;
  roles: string[];
  setAccount: (
    username: string,
    email: string,
    image: string,
    id: string,
    roles: string[]
  ) => void;
  registerAuth: (pca: IPublicClientApplication) => void;
  signIn: (scopes: string[], loginHint: string) => Promise<boolean>;
  signOut: () => void;
  refresh: () => void;
  setAuthToken: (token: string, source: AuthSource) => void;
  authtoken: string;
  authSource: AuthSource;
  transactionId: string;
  setTransactionId: (transactionId: string) => void;
  servicecalllog: ServiceCallLogEntry[];
  logServiceCall: (request: ServiceCallLogEntry) => void;
  clearServiceCallLog: () => void;
  showTracer: boolean;
  setShowTracer: (showTracer: boolean) => void;
  setAppMode: (mode: appModeTypes) => void;
  appMode: appModeTypes;
  initializing: boolean;
  setInitializing: (initializing: boolean) => void;


};
export const MagicboxContext = createContext<MagicboxContextType>({
  session: {
    user: {
      name: "",
      email: "",
      image: "",
      id: "",
      roles: [],
    },
    expires: "",
    roles: [],
    accessToken: "",
  },
  version: 0,
  refresh: () => { },
  signIn: function (scopes: string[], loginHint?: string): Promise<boolean> {
    throw new Error("Function not implemented.");
  },
  signOut: function (): void {
    throw new Error("Function not implemented.");
  },
  setAccount: function (username: string, email: string, image: string): void {
    throw new Error("Function not implemented.");
  },
  registerAuth: function (pca: IPublicClientApplication): void {
    throw new Error("Function not implemented.");
  },
  authtoken: "",
  setAuthToken: function (token: string, source: AuthSource): void {
    throw new Error("Function not implemented.");
  },
  authSource: "",
  transactionId: "",
  setTransactionId: function (transactionId: string): void {
    throw new Error("Function not implemented.");
  },
  servicecalllog: [],

  clearServiceCallLog: function (): void {
    throw new Error("Function not implemented.");
  },
  logServiceCall: function (request: ServiceCallLogEntry): void {
    throw new Error("Function not implemented.");
  },
  showTracer: false,
  setShowTracer: function (showTracer: boolean): void {
    throw new Error("Function not implemented.");
  },
  setAppMode: function (mode: appModeTypes): void {
    throw new Error("Function not implemented.");
  },
  appMode: "normal",
  roles: [],
  initializing: false,
  setInitializing: function (initializing: boolean): void {
    throw new Error("Function not implemented.");
  },
  userProfile: null
});
