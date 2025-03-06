"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  MagicboxContextType,
  MagicboxContext,
  Session,
  User,
  AuthSource,
  ServiceCallLogEntry,
  appModeTypes,
} from "./magicbox-context";
import { IPublicClientApplication, PopupRequest } from "@azure/msal-browser";
import { actionSignIn, sessionGetUser } from "@/actions/session-actions";
import { set } from "zod";
import prisma from "@/prisma";
import { UserProfile } from '@prisma/client';


type Props = {
  children?: React.ReactNode;
};

export const MagicboxProvider = ({ children }: Props) => {

  const [roles, setroles] = useState<string[]>([])
  const [session, setsession] = useState<Session>();
  const [version, setversion] = useState(0);
  const [user, setuser] = useState<User>();
  const [authtoken, setauthtoken] = useState("");
  const [authSource, setauthSource] = useState<AuthSource>("");
  const [pca, setpca] = useState<IPublicClientApplication>();
  const [transactionId, settransactionId] = useState("");
  const [koksmatToken, setkoksmatToken] = useState("")
  const servicecalllog = useMemo<ServiceCallLogEntry[]>(() => {
    return [];
  }, []);
  const [userProfile, setuserProfile] = useState<UserProfile | null>(null);

  const [appMode, setappMode] = useState<appModeTypes>("normal")

  const [showtracer, setshowtracer] = useState(false);
  const [initializing, setinitializing] = useState(true)
  const magicbox: MagicboxContextType = {
    userProfile,
    initializing,
    setInitializing: function (initializing: boolean): void {
      setinitializing(initializing);
    },
    roles,
    session,
    version,
    refresh: () => {
      setversion(version + 1);
    },
    signIn: async function (
      scopes: string[],
      loginHint?: string
    ): Promise<boolean> {

      if (!pca) throw new Error("MSAL not registered");

      const request: PopupRequest = {
        scopes,
        loginHint,
      };

      try {
        const result = await pca.loginPopup(request);
        setuser({
          name: result.account.name ?? result.account.username,
          email: result.account.username,
          image: "",
          id: result.account.localAccountId,
          roles: result.account.idTokenClaims?.roles ?? [],
        });

        return true;
      } catch (error) {
        return false;
      }
    },
    signOut: function (): void {
      pca?.loginRedirect();
    },
    setAccount: function (
      username: string,
      email: string,
      image: string,
      id: string,
      roles: string[]
    ): void {
      setuser({ name: username, email: email, image: image, id, roles });
    },

    user,
    registerAuth: function (pca: IPublicClientApplication): void {

      setpca(pca);
    },
    authtoken,
    authSource,
    setAuthToken: function (token: string, source: AuthSource) {

      setauthSource(source);
      setauthtoken(token);

      // getSession(token).then((session) => {
      //   console.log(session);
      //   // setsession(session);
      // })
    },
    setTransactionId: function (id: string): void {
      settransactionId(id);
    },
    transactionId,
    servicecalllog,
    logServiceCall: function (request: ServiceCallLogEntry): void {
      servicecalllog.push(request);
      setversion(version + 1);
    },
    clearServiceCallLog: function (): void {
      servicecalllog.splice(0, servicecalllog.length);
      setversion(version + 1);
    },
    showTracer: showtracer,
    setShowTracer: function (showTracer: boolean): void {
      localStorage.setItem("showtracer", showTracer ? "true" : "false");
      setshowtracer(showTracer);
    },
    setAppMode: function (mode: appModeTypes): void {
      setappMode(mode);
    },
    appMode
  };

  useEffect(() => {
    const showtracer = localStorage.getItem("showtracer");
    if (showtracer) {
      setshowtracer(showtracer === "true");
    }
  }, []);

  useEffect(() => {


    const load = async () => {

      const user = await sessionGetUser()
      setinitializing(false)
      setuserProfile(user)
    }
    load();
  }
    , [authtoken]);

  useEffect(() => {
    if (!userProfile) return;

  }, [userProfile])
  useEffect(() => {
    const load = async () => {
      if (!authtoken) return;

      const token = await actionSignIn(authtoken)
      setkoksmatToken(token)

    }
    load();
  }, [authtoken]);

  return (
    <MagicboxContext.Provider value={magicbox}>
      {children}
    </MagicboxContext.Provider>
  );
};
