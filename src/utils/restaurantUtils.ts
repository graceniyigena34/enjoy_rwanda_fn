/**
 * Utility functions for restaurant data formatting and operations
 */

/**
 * Format time in 24-hour format (HH:MM) to 12-hour format (H:MM AM/PM)
 * @param time - Time string in format "HH:MM" or empty string
 * @returns Formatted time string like "2:30 PM" or "Not set" if empty
 */
export function formatTimeValue(time: string | null | undefined): string {
  if (!time || typeof time !== "string" || !time.trim()) {
    return "Not set";
  }

  const [hours, minutes] = time.trim().split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return time;
  }

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Format a time range from start and end times
 * @param start - Start time in format "HH:MM"
 * @param end - End time in format "HH:MM"
 * @returns Formatted range like "2:30 PM - 10:00 PM" or "Not set"
 */
export function formatTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  const startFormatted = formatTimeValue(start);
  const endFormatted = formatTimeValue(end);

  if (startFormatted === "Not set" || endFormatted === "Not set") {
    return "Not set";
  }

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Parse restaurant hours field into opening and closing times
 * Format expected: "HH:MM - HH:MM" (e.g., "09:00 - 22:00")
 * @param hoursString - The hours string from restaurant data
 * @returns Object with opening and closing times formatted for display
 */
export function parseRestaurantHours(hoursString: string | null | undefined): {
  opening: string;
  closing: string;
  displayText: string;
} {
  if (!hoursString || typeof hoursString !== "string") {
    return {
      opening: "Not set",
      closing: "Not set",
      displayText: "Not set",
    };
  }

  const parts = hoursString.split("-").map((p) => p.trim());
  if (parts.length !== 2) {
    return {
      opening: "Not set",
      closing: "Not set",
      displayText: hoursString,
    };
  }

  return {
    opening: formatTimeValue(parts[0]),
    closing: formatTimeValue(parts[1]),
    displayText: formatTimeRange(parts[0], parts[1]),
  };
}

/**
 * Get restaurant status badge styling based on status string
 * @param status - Status string (e.g., "Open", "Closed", "Coming Soon")
 * @returns Object with styles and display text
 */
export function getStatusBadge(
  status: string | null | undefined,
): { bgColor: string; textColor: string; displayText: string } {
  const statusStr = (status || "").toLowerCase().trim();

  if (statusStr === "open" || statusStr === "") {
    return {
      bgColor: "bg-green-50 dark:bg-green-900",
      textColor: "text-green-700 dark:text-green-300",
      displayText: "Open",
    };
  }

  if (statusStr === "closed") {
    return {
      bgColor: "bg-red-50 dark:bg-red-900",
      textColor: "text-red-700 dark:text-red-300",
      displayText: "Closed",
    };
  }

  return {
    bgColor: "bg-yellow-50 dark:bg-yellow-900",
    textColor: "text-yellow-700 dark:text-yellow-300",
    displayText: status || "Unknown",
  };
}

/**
 * Format currency for display
 * @param amount - Amount in RWF
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(amount)} RWF`;
}

/**
 * Get price range display
 * @param priceRange - Price range string (e.g., "$$$", "$$$$")
 * @returns Display text
 */
export function displayPriceRange(priceRange: string | null | undefined): string {
  if (!priceRange) return "Price not available";

  const ranges: Record<string, string> = {
    $: "Budget-friendly",
    $$: "Moderate",
    $$$: "Upscale",
    $$$$: "Fine dining",
  };

  return ranges[priceRange] || priceRange;
}
