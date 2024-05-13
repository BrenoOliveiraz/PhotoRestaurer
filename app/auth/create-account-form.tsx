"use client" //só da para usar hooks react do lado do client

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as z from "zod" //valida o formulario com um schema
import { useForm } from "react-hook-form" //controla o formulario de uma forma mais eficaz, ver status do form, etc
import { zodResolver } from "@hookform/resolvers/zod" // conversor de idiomas entre zod e hookform
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

//esquema de validação do form feito com o zod
const formSchema = z.object({
    email: z.string({
        required_error: "Email is required."
    }).email({
        message: "Must be a valid email"
    }), password: z.string({
        required_error: "Password is required"
    }).min(7, {
        message: "Password must have 7 characters"
    }).max(12)
})

export default function CreateAccountForm() {

    const router = useRouter()

    //estrutura do formulario estabelecida pelo useform
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const submit = async (values: z.infer<typeof formSchema>) => {


        try {

            const supabase = createClientComponentClient()    //pq estamos em um componente de client (use client)
            const { email, password } = values

            const { error, data: { user } } = await supabase.auth.signUp({
                email, password,


            })

            //manda codigo de validação por email
            //   options: {
            //     emailRedirectTo: `${location.origin}/auth/callback`, 
            //   }

            if (user) {
                form.reset()
                // router.push('/')
                router.refresh()
            }

        } catch (error) {
            console.log("CreateAccountForm", error)
        }
    }


    return (
        <div className="flex flex-col justify-center items-center space-y-2">
            <Form {...form}>
                <form className="flex flex-col space-y-2 pb-4" onSubmit={form.handleSubmit(submit)}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email" {...field} />
                                </FormControl>
                                <FormDescription>This is your Email</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"

                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Password" {...field} />
                                </FormControl>
                                <FormDescription>This is your Password</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button>Create Account</Button>

                </form>


            </Form>

        </div>
    )
}
