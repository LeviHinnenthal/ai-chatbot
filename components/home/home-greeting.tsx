import React from "react";

const HomeGreeting = ({ user }: { user: any }) => {
  return (
    <div className="mb-2 mt-4 text-start w-fit">
      <h1 className="text-2xl font-semibold tracking-tight w-fit">
        Dein KI Portal{" "}
      </h1>

      <p className="mt-2 text-sm font-normal w-fit">
        Guten Morgen{" "}
        {user?.name && (
          <span className="">{user.name}. Wie kann ich dir heute helfen?</span>
        )}
      </p>
    </div>
  );
};

export default HomeGreeting;
