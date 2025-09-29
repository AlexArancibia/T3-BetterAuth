import { generateOrganizationSchema } from "~/lib/structured-data";
import { generateWebSiteSchema } from "~/lib/structured-data";
import { generateSoftwareApplicationSchema } from "~/lib/structured-data";

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteSchema()),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareApplicationSchema()),
        }}
      />
    </>
  );
}
