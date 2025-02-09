"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMsal, useAccount } from "@azure/msal-react";
import { MagicboxContext } from "@/contexts/magicbox-context";
import { https } from "@/contexts/httphelper";

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

  const aquireToken = async (apiScope: APIScopeProps) => {
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
        } catch (error) {
          setlatestError(error);
        }
      }
    }
  };

  useEffect(() => {
    const load = async () => {

      if (magicbox.authtoken) {
        settoken(magicbox.authtoken);
        return;
      }
      //TODO: make the aquiring of token return a value that can be used here
      await aquireToken(apiScope);
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
  if (!magicbox.user) {
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
                magicbox.refresh();
              }}
            >
              Sign In using Microsoft 365 account
            </Button>
          </div>
          <div className="grow"></div>
        </div>
        <div className="grow"></div>
      </div>
    );
  }
  return <div>{children}</div>;
}
