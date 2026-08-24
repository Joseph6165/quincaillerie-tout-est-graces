"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/app/(dashboard)/parametres/actions";

export default function MarkNotificationsRead() {
  useEffect(() => {
    markNotificationsRead();
  }, []);

  return null;
}