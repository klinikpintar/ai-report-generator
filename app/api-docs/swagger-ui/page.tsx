"use client";

// app/api-docs/swagger-ui/page.tsx

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const url =
  "https://api.swaggerhub.com/apis/ai-report-generator/ai-report-generator/1/swagger.json";

export default function IndexPage() {
  return (
    <section className="container">
      <SwaggerUI url={url} />
    </section>
  );
}
