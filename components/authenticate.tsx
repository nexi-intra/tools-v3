"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMsal, useAccount } from "@azure/msal-react";
import { MagicboxContext } from "@/contexts/magicbox-context";
import { https } from "@/contexts/httphelper";
import { useRouter } from "next/navigation";
import { set } from "zod";

interface APIScopeProps {
  scopes: string[];
  title: string;
  testurl: string;
  token?: string;
}
export const UserProfileAPI: APIScopeProps = {
  scopes: ["User.Read"],
  title: "Read user profile",
  testurl: "https://graph.microsoft.com/v1.0/me",
};

export default function Authenticate(props: {
  apiScope: APIScopeProps;
  children: any;
}) {
  const { apiScope, children } = props;
  const magicbox = useContext(MagicboxContext);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [latestResponse, setlatestResponse] = useState<any>();
  const [token, settoken] = useState("");
  const [latestError, setlatestError] = useState<any>();
  const router = useRouter();
  const [signinError, setsigninError] = useState(false)

  async function aquireToken(apiScope: APIScopeProps): Promise<string | null> {
    let result: string | null = null;
    //debugger
    setlatestError(undefined);
    setlatestResponse(undefined);
    await instance.initialize();
    if (account && apiScope) {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: apiScope?.scopes ?? [],
          account: account,
        });
        apiScope.token = response.accessToken;
        magicbox.setAuthToken(response.accessToken, "MSAL");
        settoken(response.accessToken);
        const getResponse = await https(
          response.accessToken,
          "GET",
          apiScope.testurl
        );
        setlatestResponse(getResponse);
        result = response.accessToken;
      } catch (error) {
        try {
          const response = await instance.acquireTokenPopup({
            scopes: apiScope?.scopes ?? [],
            account: account,
          });
          apiScope.token = response.accessToken;
          settoken(response.accessToken);
          magicbox.setAuthToken(response.accessToken, "MSAL");
          const getResponse = await https(
            response.accessToken,
            "GET",
            apiScope.testurl
          );
          setlatestResponse(getResponse);
          result = response.accessToken;
        } catch (error) {
          setlatestError(error);
        }
      }
    }
    return result;
  };

  useEffect(() => {
    const load = async () => {

      if (magicbox.authtoken) {
        settoken(magicbox.authtoken);
        return;
      }

      const token = await aquireToken(apiScope);
      if (!token) return;
      settoken(token);

      router.refresh();

    };
    if (!apiScope || apiScope === undefined) return;
    load();

    const refreshInterval = setInterval(() => {
      aquireToken(apiScope);
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval); // Cleanup on unmount
  }, [apiScope]);

  if (!magicbox) {
    return <div>no magicbox</div>;
  }
  if (!magicbox.user && magicbox.authtoken === "") {
    return (
      <div className="flex h-screen">
        <div className="grow"></div>
        <div className="flex flex-col">
          <div className="grow"></div>
          <div>
            {" "}
            <Button
              onClick={async () => {
                const signedIn = await magicbox.signIn(["User.Read"], "");
                if (!signedIn) {
                  setsigninError(true);
                  return
                }
                const token = await aquireToken(apiScope);
                if (!token) {

                  window.location.reload();
                } else {
                  settoken(token);
                  magicbox.refresh();
                }

              }}
            >
              Sign In using Microsoft 365 account
            </Button>

            {signinError && <div>Last sign in failed - {latestError}</div>}
          </div>
          <div className="grow"></div>
        </div>
        <div className="grow"></div>
      </div>
    );
  }
  return <div>{children}</div>;
}
