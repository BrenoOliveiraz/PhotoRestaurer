//5 passo instalar o shadcnui
//6 passo configurar o client, se está logado faz algo, se n, faz outra coisa



import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"; //hellper para trabalhar com frameworks q utilizam server components
import { RedirectType, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import CreateAccountForm from "./auth/create-account-form";
import LoginAccountForm from "./auth/login-account-form";


export default async function Home() {

  let loggedIn = false;
  //tentando ver se o usuario está logado
  try {
    const supabase = createServerComponentClient({ cookies })

    //entrando dentro do data e pegando o objeto "session"
    const { data: { session }, } = await supabase.auth.getSession()

    if (session) loggedIn = true


  } catch (error) {
    console.log("Home", error)

  } finally {

    //caso esteja logado, irá para a página user-app
    if (loggedIn) redirect('/user-app', RedirectType.replace)
  }

  //se não estiver logado, irá para Home
  return (
    <div className="flex flex-col h-screen w-full justify-center items-center">
      <Tabs defaultValue="create-account" className="w-[400px] border rounded-md  shadow-2xl">
        <TabsList className="flex justify-around  items-center rounded-b-none">
          <TabsTrigger
            className="transition-all delay-100"
            value="create-account">CreateAccount</TabsTrigger>
          <TabsTrigger
            className="transition-all delay-100"
            value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="create-account">
          <CreateAccountForm />

        </TabsContent>
        <TabsContent value="login">
        <LoginAccountForm/>
        </TabsContent>
      </Tabs>

    </div>
  );
}
