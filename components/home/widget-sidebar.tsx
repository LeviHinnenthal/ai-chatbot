import React from "react";
import ToDosWidget from "./to-dos-widget";
import InspirationWidget from "./inspiration-widget";

const WidgetSidebar = ({ user }: { user: any }) => {
  return (
    <div className="hidden lg:flex h-[calc(100svh-0rem)] overflow-y-auto flex-col gap-4 p-4 lg:w-[25rem] xl:w-[30rem] border-l sticky top-14">
      <ToDosWidget user={user} />
      <InspirationWidget />
    </div>
  );
};

export default WidgetSidebar;
