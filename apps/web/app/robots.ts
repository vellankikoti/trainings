import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devopsengineer.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/paths/", "/learn/", "/about", "/certificates/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/onboarding/",
          "/sign-in/",
          "/sign-up/",
          "/quiz/",
          "/profile/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
