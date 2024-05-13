//3 passo, configurar o midlawere


import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server' //res

import {createMiddlewareClient} from "@supabase/auth-helpers-nextjs" // função q traz as informações do supabase baseado nas variaveis locais

export async function middleware(req: NextRequest) {

    const res = NextResponse.next()

    try{
        const supabase = createMiddlewareClient({req, res})
        await supabase.auth.getSession()
        

    } catch(err){

    }

}

// faz o refresh do token pro usuário não precisar ficar toda hora se relogando
