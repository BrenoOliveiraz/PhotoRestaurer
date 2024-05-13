'use client'

import { UserNav } from "../ui/common/user-nav"



export default function UserHeader () {
    return (
        <header className="m-2 px-2">
            <nav className="flex justify-between items-center">
                <span className="font-extrabold">re<span className="font-extralight">Store</span></span>
                <UserNav/>
            </nav>
        </header>
    )
}
