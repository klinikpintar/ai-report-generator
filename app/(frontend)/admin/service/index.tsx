import React from "react";
import { ServiceSection } from "./sections/service-section";

const ServiceModule = () => {
  return (
    <section className="container mx-auto flex flex-col gap-y-6 py-8 items-center">
      <ServiceSection />
    </section>
  );
};

export default ServiceModule;
