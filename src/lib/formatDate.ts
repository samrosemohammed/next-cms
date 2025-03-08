import { format } from "date-fns";

export const formatDate = (date: string) => {
  const currentYear = new Date().getFullYear();
  const fileYear = new Date(date).getFullYear();
  return currentYear === fileYear
    ? format(date, "MMMM dd, hh:mm a")
    : format(date, "MMMM dd, yyyy, hh:mm a");
};
