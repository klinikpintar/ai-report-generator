import React from "react";
import { ServiceSection } from "./sections/service-section";

const ServiceModule = () => {
  return (
    <section className="container mx-auto flex flex-col gap-y-6 py-8 mt-16 items-center mb-5">
      <ServiceSection />
    </section>
  );
};

export default ServiceModule;
