import Alumn from "./alumn-temp";
import Contract from "./contract";
import Course from "./course";
import Guarantor from "./guarantor";

export default interface ContractData {
  alumn: Alumn | null;
  guarantor: Guarantor | null;
  course: Course | null;
  contract: Contract | null;
}
