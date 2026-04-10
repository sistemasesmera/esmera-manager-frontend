export default interface BackendAlumn {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  documentType: string;
  documentNumber: string;
  address: string;
  postalCode: string;
  population: string;
  province: string;
  isVerified: boolean;
  code: string | null;
  createdAt: string;
  updatedAt: string;
}
