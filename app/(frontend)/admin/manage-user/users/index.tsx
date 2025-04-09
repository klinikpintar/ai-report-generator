import React from "react";
import { UserTableSection } from "./sections";

const UsersModule = () => {
  return (
    <section className="container mx-auto max-w-screen-lg flex flex-col gap-y-6 py-8 pt-[92px]">
      <UserTableSection />
    </section>
  );
};

export default UsersModule;
