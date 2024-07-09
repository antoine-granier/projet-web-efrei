import { Button } from "flowbite-react";
import { IoIosAdd, IoMdExit } from "react-icons/io";
import { Outlet } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useUserStore } from "../store/userStore";

const LayoutPage: React.FC = () => {
  const user = useUserStore((state) => state.user);

  return (
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
            <Button size="xs">
              <IoIosAdd className="h-6 w-6" />
            </Button>
            <Button size="xs">
              <IoMdExit className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <p className="text-lg font-bold p-2">Chats</p>
      </div>

      <div className="h-full overflow-auto md:w-full px-2 py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutPage;
