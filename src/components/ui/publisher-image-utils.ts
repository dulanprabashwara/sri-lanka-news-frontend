export function isPublisherPlaceholder(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Reject exact known fallback stock images used by Daily Mirror / Lankadeepa / Divaina
  if (lowerUrl.includes("image_8df7de9e07")) return true;
  if (lowerUrl.includes("image_ef4bce8a81")) return true;
  
  // Reject explicit logo images to prevent the same 20 logos in the grid
  if (lowerUrl.includes("logo")) return true;
  
  // Optional: Reject generic 'default' patterns if desired
  if (lowerUrl.includes("default.jpg") || lowerUrl.includes("default.png")) return true;
  
  return false;
}
