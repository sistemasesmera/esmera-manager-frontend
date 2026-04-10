import BackendAlumn from "./backendAlumn";
import Commercial from "./backendCommercial";
import Course from "./backendCourse";

export default interface BackendContract {
  id: string;
  coursePrice: number;
  name: string;
  hasGuarantor: boolean;
  guarantorFirstName: string | null;
  guarantorLastName: string | null;
  guarantorPhone: string | null;
  guarantorBirthDate: string | null;
  guarantorEmail: string | null;
  guarantorDocumentType: string | null;
  guarantorDocumentNumber: string | null;
  guarantorAddress: string | null;
  guarantorPostalCode: string | null;
  guarantorPopulation: string | null;
  guarantorProvince: string | null;
  paymentAgreement: string;
  observations: string;
  contractDate: string;
  presentationDate: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  classSchedule: string;
  missingDocumentation: string;
  uniformSize: string;
  latestStudies: string;
  additionalCourse: string;
  createdAt: Date;
  updatedAt: Date;
  alumn: BackendAlumn;
  course: Course;
  user: Commercial;
  branch: {
    id: string;
    name: string;
    address: string;
    phone: string;
    city: string | null;
  };
}
