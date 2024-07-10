import { IoMdPerson } from "react-icons/io";
import { twMerge } from "tailwind-merge";

type MessageProps = {
  content: string;
  author: string;
  variant?: "right" | "left";
};

const Message: React.FC<MessageProps> = ({
  content,
  author,
  variant = "left",
}) => {
  return (
    <div
      className={twMerge(
        "w-full flex flex-col gap-1",
        variant === "left" ? "items-start" : "items-end"
      )}
    >
      <div
        className={twMerge(
          "flex flex-col",
          variant === "left" ? "items-start" : "items-end"
        )}
      >
        <div className="flex items-center mb-2 gap-2">
          <IoMdPerson />
          <p>{author}</p>
        </div>
        <div
          className={twMerge(
            "p-2 rounded-lg text-sm w-fit",
            variant === "left" ? "bg-slate-300" : "bg-[#0d7490] text-white"
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default Message;
