"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMsal, useAccount } from "@azure/msal-react";
import { MagicboxContext } from "@/contexts/magicbox-context";
import { https } from "@/contexts/httphelper";
import { useRouter } from "next/navigation";
import { set, z } from "zod";
import { SupportedLanguage, useLanguage } from "@/contexts/language-context";
import { AnimatedBackground } from "./animated-background";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
const translationSchema = z.object({
  login: z.string(),
  magicbuttons: z.string(),

});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    login: "Login",
    magicbuttons: "Intranet"
  },
  da: {
    login: "Log ind",
    magicbuttons: "Intranet"
  },
  it: {
    login: "Accesso",
    magicbuttons: "Intranet"

  }

};
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

}) {
  const { apiScope } = props;
  const magicbox = useContext(MagicboxContext);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [latestResponse, setlatestResponse] = useState<any>();
  const [token, settoken] = useState("");
  const [latestError, setlatestError] = useState<any>();
  const router = useRouter();
  const [signinError, setsigninError] = useState(false)
  const { language } = useLanguage()
  const t = translations[language]
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
      <div className="relative z-50 min-w-[300px]">


        <Card className="z-50 w-full p-8 shadow-xl bg-white dark:bg-black">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2 space-x-4">

              <img
                src="/nexiblue.svg"
                alt="Nexi Logo"

                height={32}
                className="h-7"
              />

              <CardTitle className="text-[34px] font-bold text-[#2d32aa]"> intranet</CardTitle>
            </div>

          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-6 py-4">



            </div>
          </CardContent>
          <CardFooter>

            <Button
              className="w-full bg-[#1a237e] hover:bg-[#303f9f]"

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
              {t.login}
            </Button>
          </CardFooter>

        </Card>
      </div>

    )

  }
  return null;
}
