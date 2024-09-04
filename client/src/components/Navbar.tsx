import AppLogo from "@/icons/AppLogo"
import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="bg-[#13131373] py-8 flex justify-center">
        <Link to="/" className="flex items-center gap-2 font-semibold">
            <AppLogo className="" />
        </Link>

    </nav>
  )
}

export default Navbar