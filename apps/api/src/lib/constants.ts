export const DEPARTMENTS = [
  "Choir",
  "Drama",
  "Ushering",
  "Protocol",
  "Prayer",
  "Bible Study",
  "Evangelism",
  "Welfare",
  "Follow-up",
  "Media & Publicity",
  "Sports",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export type GenderInput = (typeof GENDERS)[number];
