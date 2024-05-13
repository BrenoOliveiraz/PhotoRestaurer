'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from 'react-dropzone'


//vai servir pra mostrar a imagem arrastada na tela
interface FilePreview {
  file: Blob,
  preview: string
}


//gerenciamento de estado da dialog onOpenChange (abrir e fechar)
export default function ImageUploadPlaceholder() {
  //processo de hidratação
  const [isMounted, setIsMounted] = useState(false)

  //Bloco de códigos para tratar a imagem aplicação sup a base
  //imagem na tela para capturar no sup a base
  const [file, setFile] = useState<FilePreview | null>()
  //imagem capturada para AI tratar

  const [fileToProcess, setFileToProcess] = useState<{ path: string } | null>()
  //imagem retornada pela AI
  const [restoredFile, setRestoredFile] = useState<FilePreview | null>()


  //função passada como parametro do useDropzone para pegar o arquivo do "drag"
  const onDrop = useCallback(async (acceptFiles: File[]) => {
    try {
      //captura o arquivo
      const file = acceptFiles[0]

      //cria uma url do arquivo de imagem temporária
      setFile({
        file, preview: URL.createObjectURL(file)
      })

      //instanciar o supabase e enviar a imagem através das variaveis locais
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER).upload(`${process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER_PROCESSING}/${acceptFiles[0].name}`, acceptFiles[0])

      if (!error) {
        setFileToProcess(data)

        console.log("fileToProcess", data)
      }

    } catch (error) {
      console.log('OnDrop', error)
    }
  }, [])

  useEffect(() => {
    //processo de hidratação
    setIsMounted(true)
    //quando passado como função, serve como tratamento de unmount da memória alocada pelo URL.create..
    return () => {
      if (file) URL.revokeObjectURL(file.preview)
    }
  }, [])

  //getRootProps servirá para a div obter as propriedades necessárias para criar área de drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,

    maxFiles: 1,

    //especifica os tipos de arquivos aceitos, consequentemente bloqueia o que não for expresso.
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg']
    }

  })
  const handleDialogChange = async (e: boolean) => {

  }
  const handleEnhance = async () => {
    try {

      const supabase = createClientComponentClient()

      const { data: publicUrl } = await supabase.storage.from(process.env.NEXT_PUBLIC_SUPABASE_APP_BUCKET_IMAGE_FOLDER).getPublicUrl(`${fileToProcess?.path}`)

      //acessa a rota criada da api
      const res = await fetch('/api/ai/replicate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageUrl: publicUrl
        })
      })

      //atualizando o estado da imagem restaurada
      const restoredImageUrl = await res.json()

      //atualizando a imagem restaurada
      const readImageRes = await fetch(restoredImageUrl.data)

      //blob
      const imageBlob = await readImageRes.blob()

      setRestoredFile({
        file: imageBlob,
        preview: URL.createObjectURL(imageBlob)
      })


      console.log(publicUrl)

    } catch (error) {
      console.log("handleEnhance", error)
    }
  }

  if (!isMounted) return null


  return (
    <div className="flex h-[250px] w-full shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="11" r="1" />
          <path d="M11 17a1 1 0 0 1 2 0c0 .5-.34 3-.5 4.5a.5.5 0 0 1-1 0c-.16-1.5-.5-4-.5-4.5ZM8 14a5 5 0 1 1 8 0" />
          <path d="M17 18.5a9 9 0 1 0-10 0" />
        </svg>

        <h3 className="mt-4 text-lg font-semibold">Just add a Photo</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Use AI to enhance your photo
        </p>
        <Dialog onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="relative">
              Bring your past to Life
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle> Add Photo </DialogTitle>
              <DialogDescription>
                Drag a photo in order to Upload.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                {
                  !file &&
                  //criando uma div compatível para dragzone
                  (<div {...getRootProps()}>
                    <input {...getInputProps()} />

                    {
                      //condicional para checar se o usuário está na ação de drag, caso não esteja, aparecerá o segundo <p>
                      isDragActive ? (

                        <p className="flex items-center justify-center bg-blue-100 opacity-70 border border-blue-300 p-6 h-36 rounded-md"> Drop your Photo here... </p>
                      ) : <p className="flex items-center justify-center bg-blue-100 opacity-70 border border-blue-300 p-6 h-36 rounded-md">Drag or Click to choose a image...  </p>
                    }
                  </div>)}

                {/* quando adicionar a imagem, aparecerá essa div */}
                <div className="flex flex-col items-center justify-evenly sm:flex-row gap-2">
                  {file &&
                    <div className="flex flex-row flex-wrap drop-shadow-md">
                      <div className="flex w-48 h-48 relative">
                        <img src={file.preview} className="w-48 h-48 object-contain rounded-md"
                          onLoad={() => URL.revokeObjectURL(file.preview)}
                        />

                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEnhance} className="w-full">Enhance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}



