import { Link, NavLink } from "react-router-dom";
import MemoLogo from "@/icons/Logo";
import { NavLinks } from "@/lib/data";
import ExtensionCard from "./Cards/ExtensionCard";
import { useEffect, useState } from "react";
import ConnectModal from "./Modals/ConnectModal";
import { useActiveAccount } from "thirdweb/react";

const Sidebar = () => {
  const [openConnectModal, setOpenConnectModal] = useState(false);

  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const handleNavigate = (e: any) => {
    if (!isConnected) {
      e.preventDefault();
      setOpenConnectModal(true);
    }
  };

  useEffect(() => {
      if (!isConnected) {
        setOpenConnectModal(true);
      } else {
        setOpenConnectModal(false);
      }
    }, [isConnected, account]);

  return (
    <main>
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <div className="hidden rounded-2xl border-r p-2 border-[#13131373]  bg-[#13131373]  md:block">
          <div className="flex h-full max-h-fit shadow-lg  rounded-xl  flex-col gap-2">
            <div className="flex items-center py-12 px-4 lg:h-[60px] lg:px-6">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-semibold">
                <MemoLogo className="w-40 h-40" />
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end
                    onClick={handleNavigate}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#F1F1F1] bg-[#1E1E1E99] transition-all"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#B5B5B5] transition-all"
                    }>
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <link.activeIcon className="w-5 h-5" />
                        ) : (
                          <link.icon className="w-5 h-5" />
                        )}
                        {link.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-4">
              <ExtensionCard />
            </div>
          </div>
        </div>
      </div>
      {openConnectModal && (
        <ConnectModal
          isConnectModalOpen={openConnectModal}
          setIsConnectModalOpen={setOpenConnectModal}
        />
      )}
    </main>
  );
};

export default Sidebar;
