import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Folapp",
    short_name: "Folapp",
    description:
      "Order management for East African social sellers. Turn chat chaos into sales control.",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: "#f7faf8",
    theme_color: "#0F5D46",
    categories: ["business", "productivity", "finance"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "New Order",
        short_name: "Add Order",
        description: "Capture a new sale quickly",
        url: "/orders/new",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Orders",
        short_name: "Orders",
        description: "Open your order workflow board",
        url: "/orders",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    share_target: {
      action: "/api/payments/reconcile-sms",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        text: "rawSms",
      },
    },
  };
}
