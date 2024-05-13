import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

interface NextRequestWithImage extends NextRequest {
    imageUrl: string
}

export async function POST(req: NextRequestWithImage, res: NextResponse) {

    const { imageUrl } = await req.json()

    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session }, error } = await supabase.auth.getSession()

    if (!session || error) new NextResponse('Login in order to restore images'), { status: 500 }


    //processo de envio da imagem para o replicate e receber as informações da api para trabalhar
    const startRestoreProcess = await fetch('https://api.replicate.com/v1/predictions',
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                //passar o nosso token gravado em variável de ambiente
                Authorization: "Token " + process.env.REPLICATE_API_TOKEN,
            },
            body: JSON.stringify({
                version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
                input: {
                    img: imageUrl,
                    version: "v1.4",
                    scale: 2
                }
            })
        })

        //começar a utilizar a resposta da API para tratamento
        let jsonStartProcessResponse = await startRestoreProcess.json()
        console.log("Resposta da API do Replicate:", jsonStartProcessResponse)
        

        //capturando url da imagem gerada pelo replicate
        let endpointUrl = jsonStartProcessResponse.urls.get

        //imagem restaurada começa como nula, para ser capturada no laço da promise
        let restoredImage: string | null = null
        //laço para capturar a imagem restaurada e jogar na variável acima
        while(!restoredImage){
            console.log("Polling image...")
            let finalResponse = await fetch(endpointUrl,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    //passar o nosso token gravado em variável de ambiente
                    Authorizathion: "Token" + process.env.REPLICATE_API_TOKEN,
                },
            })
            let jsonFinalresponse = await finalResponse.json()
            //api do replicate retorna succed ou failed
            if(jsonFinalresponse === "succed"){
                //se retornar sucesso, transforma a variável antes vazia, no output gerado da api
                restoredImage = jsonFinalresponse.output
            } else if (jsonFinalresponse.status === 'failed'){
                break //TODO - gerar erro para interface user
            } else{
                await new Promise((resolve) =>{
                    setTimeout(resolve, 1000)
                })
            }
        }


    return NextResponse.json({ data: restoredImage ? restoredImage : "Failed to restore Image" }), {
        status: 200
    }



}