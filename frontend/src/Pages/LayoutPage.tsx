import { Button } from "flowbite-react";
import { IoIosAdd, IoMdExit } from "react-icons/io";
import { Outlet } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useUserStore } from "../store/userStore";
import ChatList from "../components/ChatList";
import CreateChatModal from "../components/CreateChatModal";
import { useState } from "react";

const LayoutPage: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={twMerge(
          "flex flex-col-reverse h-screen w-screen overflow-hidden ",
          "md:flex-row"
        )}
      >
        <div className="w-1/3 border-r flex flex-col gap-2">
          <div className="flex justify-between items-center px-2 py-4 border-b">
            <p>{user?.name}</p>
            <div className="flex items-center gap-2">
              <Button size="xs" onClick={() => setOpen(!open)}>
                <IoIosAdd className="h-6 w-6" />
              </Button>
              <Button size="xs" onClick={() => setUser(null)}>
                <IoMdExit className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <ChatList />
        </div>

        <div className="h-full overflow-auto w-2/3 px-2 py-4">
          <Outlet />
        </div>
      </div>
      <CreateChatModal open={open} setOpen={setOpen} />
    </>
  );
};

export default LayoutPage;
