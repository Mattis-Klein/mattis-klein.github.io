export const CATEGORY_IDS = [
  "surveillance",
  "networking",
  "smart-home",
  "access",
  "safety",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  index: string;
  title: string;
  summary: string;
  supplies: readonly string[];
  note: string;
  point: string;
};

export const categories: readonly Category[] = [
  {
    id: "surveillance",
    index: "01",
    title: "Surveillance & Security",
    summary:
      "Cameras, network video recorders, and video recording equipment for homes, businesses, and buildings.",
    supplies: [
      "Security cameras and surveillance equipment",
      "NVRs and video recording",
    ],
    note: "MHM Global sells and distributes this equipment. Installation is not part of the offer.",
    point: "Cameras, NVRs, and video recording equipment.",
  },
  {
    id: "networking",
    index: "02",
    title: "Networking & Connectivity",
    summary:
      "Routers and networking equipment that keep rooms, floors, and buildings online.",
    supplies: ["Routers", "Networking equipment for homes and businesses"],
    note: "Supplied as product. MHM Global does not install or manufacture networking gear.",
    point: "Routers and networking equipment for homes and businesses.",
  },
  {
    id: "smart-home",
    index: "03",
    title: "Smart Home Technology",
    summary:
      "Thermostats and smart-home devices for everyday control in a residence or smaller space.",
    supplies: ["Thermostats", "Smart-home devices"],
    note: "Retail and wholesale supply. Setup and installation are outside this role.",
    point: "Thermostats and smart-home devices — one part of the wider range.",
  },
  {
    id: "access",
    index: "04",
    title: "Access Control",
    summary:
      "Electronic locks, video doorbells, and intercoms for entries at homes, businesses, and buildings.",
    supplies: ["Electronic locks and access control", "Video doorbells", "Intercoms"],
    note: "MHM Global distributes the equipment. It does not provide security installation.",
    point: "Electronic locks, video doorbells, and intercoms.",
  },
  {
    id: "safety",
    index: "05",
    title: "Life Safety",
    summary: "Smoke detectors and related safety devices for occupied spaces.",
    supplies: ["Smoke detectors", "Safety devices"],
    note: "Product supply only. This is not a life-safety installation service.",
    point: "Smoke detectors and related safety devices.",
  },
];

export function categoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
