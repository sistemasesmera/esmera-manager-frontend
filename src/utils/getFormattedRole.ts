type Role = "COMMERCIAL_PLUS" | "COMMERCIAL" | "ADMIN"; // Definir los roles posibles

export default function getFormattedRole(role: string) {
  // Mapeo de casos especiales
  const specialCases: Record<Role, string> = {
    COMMERCIAL_PLUS: "Commercial Plus",
    COMMERCIAL: "Commercial",
    ADMIN: "Administrator",
  };
  console.log(specialCases);

  // Si no es un caso especial, convertir la cadena separando por guiones bajos
  return role
    .split("_") // Separar por guión bajo
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalizar cada palabra
    .join(" "); // Unir las palabras con espacio
}
