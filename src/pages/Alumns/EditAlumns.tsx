import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../axios/axiosConfig";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface AlumnForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  birthDate: string;
  documentType: string;
  documentNumber: string;
  address: string;
  postalCode: string;
  population: string;
  province: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditAlumn() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Extraemos datos de la URL (o "" / false si no existen)
  const firstNameFromUrl = searchParams.get("firstName") || "";
  const lastNameFromUrl = searchParams.get("lastName") || "";
  const emailFromUrl = searchParams.get("email") || "";
  const phoneFromUrl = searchParams.get("phone") || "";
  const isVerifiedFromUrl = searchParams.get("isVerified") === "true";
  const birthDateFromUrl = searchParams.get("birthDate") || "";
  const documentTypeFromUrl = searchParams.get("documentType") || "";
  const documentNumberFromUrl = searchParams.get("documentNumber") || "";
  const addressFromUrl = searchParams.get("address") || "";
  const postalCodeFromUrl = searchParams.get("postalCode") || "";
  const populationFromUrl = searchParams.get("population") || "";
  const provinceFromUrl = searchParams.get("province") || "";
  const codeFromUrl = searchParams.get("code") || "";
  const createdAtFromUrl = searchParams.get("createdAt") || "";
  const updatedAtFromUrl = searchParams.get("updatedAt") || "";

  const [form, setForm] = useState<AlumnForm>({
    firstName: firstNameFromUrl,
    lastName: lastNameFromUrl,
    email: emailFromUrl,
    phone: phoneFromUrl,
    isVerified: isVerifiedFromUrl,
    birthDate: birthDateFromUrl,
    documentType: documentTypeFromUrl,
    documentNumber: documentNumberFromUrl,
    address: addressFromUrl,
    postalCode: postalCodeFromUrl,
    population: populationFromUrl,
    province: provinceFromUrl,
    code: codeFromUrl,
    createdAt: createdAtFromUrl,
    updatedAt: updatedAtFromUrl,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detectamos si no hay datos en la URL para cargar desde API
    const noDataFromUrl =
      !firstNameFromUrl && !lastNameFromUrl && !emailFromUrl;

    if (!noDataFromUrl) return; // Ya tenemos datos suficientes desde URL

    const fetchAlumn = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`alumns/`);
        const alumn = response.data.data || response.data; // depende de la API
        setForm({
          firstName: alumn.firstName || "",
          lastName: alumn.lastName || "",
          email: alumn.email || "",
          phone: alumn.phone || "",
          isVerified: alumn.isVerified || false,
          birthDate: alumn.birthDate || "",
          documentType: alumn.documentType || "",
          documentNumber: alumn.documentNumber || "",
          address: alumn.address || "",
          postalCode: alumn.postalCode || "",
          population: alumn.population || "",
          province: alumn.province || "",
          code: alumn.code || "",
          createdAt: alumn.createdAt || "",
          updatedAt: alumn.updatedAt || "",
        });
      } catch {
        setError("No se pudo cargar el alumno.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumn();
  }, [firstNameFromUrl, lastNameFromUrl, emailFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="flex flex-col items-center">
          <SpinnerThree />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando datos del alumno...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={"Alumnos"} />
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md dark:bg-white/[0.03] dark:border dark:border-white/[0.05]">
        {error && (
          <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
        )}

        <form onSubmit={() => {}} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna 1 */}
            <div>
              <label
                htmlFor="firstName"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400
               dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 e dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400 e"
              >
                Fecha de Nacimiento
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="documentType"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Tipo de Documento
              </label>
              <input
                id="documentType"
                name="documentType"
                type="text"
                value={form.documentType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            {/* Columna 2 */}
            <div>
              <label
                htmlFor="documentNumber"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Número de Documento
              </label>
              <input
                id="documentNumber"
                name="documentNumber"
                type="text"
                value={form.documentNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Dirección
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Código Postal
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="population"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Población
              </label>
              <input
                id="population"
                name="population"
                type="text"
                value={form.population}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="province"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Provincia
              </label>
              <input
                id="province"
                name="province"
                type="text"
                value={form.province}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              id="isVerified"
              name="isVerified"
              type="checkbox"
              checked={form.isVerified}
              onChange={handleChange}
            />
            <label
              htmlFor="isVerified"
              className="text-gray-700 dark:text-gray-300 select-none"
            >
              Verificado
            </label>
          </div>

          <div className="pt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Creado el:</strong>{" "}
              {form.createdAt
                ? new Date(form.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
            <p>
              <strong>Actualizado el:</strong>{" "}
              {form.updatedAt
                ? new Date(form.updatedAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>

          <div className="pt-6 flex space-x-3">
            <Button type="submit" disabled={loading}>
              Guardar
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/alumns")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
