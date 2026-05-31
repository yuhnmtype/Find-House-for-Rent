// Global configuration for the Find House for Rent frontend.
// Change API_ORIGIN if the backend runs on a different host/port.

const API_ORIGIN = "http://localhost:3000";
const API_BASE = API_ORIGIN + "/api";

// HCMC districts.
const HCMC_DISTRICTS = [
  "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7",
  "Quận 8", "Quận 10", "Quận 11", "Quận 12",
  "Bình Thạnh", "Bình Tân", "Gò Vấp", "Phú Nhuận", "Tân Bình",
  "Tân Phú", "Thành phố Thủ Đức", "Nhà Bè", "Hóc Môn", "Bình Chánh",
];

// House types.
const HOUSE_TYPES = [
  { value: "ROOM", label: "Phòng trọ / Room" },
  { value: "APARTMENT", label: "Căn hộ / Apartment" },
  { value: "HOUSE", label: "Nhà nguyên căn / House" },
  { value: "DORMITORY", label: "Ký túc xá / Dormitory" },
];

const INTERIOR_TYPES = [
  { value: "FURNISHED", label: "Full furnished" },
  { value: "SEMI_FURNISHED", label: "Semi furnished" },
  { value: "UNFURNISHED", label: "Unfurnished" },
];

const HOUSE_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "PENDING", label: "Pending" },
  { value: "RENTED", label: "Rented" },
  { value: "INACTIVE", label: "Inactive" },
];

// Landlord can set these manually; PENDING is handled by the system.
const LANDLORD_SETTABLE_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RENTED", label: "Rented" },
  { value: "INACTIVE", label: "Inactive" },
];

// Amenities with labels and icons.
const AMENITY_MAP = {
  wifi: { label: "Wifi", icon: "wifi" },
  ac: { label: "Air conditioning", icon: "snow" },
  parking: { label: "Parking", icon: "p-square" },
  washing_machine: { label: "Washing machine", icon: "droplet" },
  balcony: { label: "Balcony", icon: "border-width" },
  security: { label: "24/7 security", icon: "shield-check" },
  yard: { label: "Yard", icon: "tree" },
  kitchen: { label: "Kitchen", icon: "fire" },
  fridge: { label: "Fridge", icon: "box" },
  water_heater: { label: "Water heater", icon: "thermometer-half" },
};

const AMENITY_OPTIONS = Object.keys(AMENITY_MAP);
