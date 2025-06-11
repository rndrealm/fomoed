import { atom } from "jotai";
import { UserGeoLocation } from "@/services/queries/geolocation/types";

// Initial state can be null until fetched
export const geoLocationAtom = atom<UserGeoLocation | null>(null);

// Atom to set the location after fetching
export const setGeoLocationAtom = atom(
  null,
  (get, set, location: UserGeoLocation) => {
    set(geoLocationAtom, location);
  }
);
