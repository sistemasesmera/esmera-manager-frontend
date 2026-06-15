import { useState } from "react";
import { useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Step1 from "../../components/contracts/CreateContractSteps/Step1";
import Step2 from "../../components/contracts/CreateContractSteps/Step2";
import Step3 from "../../components/contracts/CreateContractSteps/Step3";
import Step4 from "../../components/contracts/CreateContractSteps/Step4";
import Step5 from "../../components/contracts/CreateContractSteps/Step5";
import ContractData from "../../types/frontend/contractData";
import Guarantor from "../../types/frontend/guarantor";
import axiosInstance from "../../axios/axiosConfig";
import SuccessModal from "../../components/contracts/CreateContractSteps/SuccessModal";
import BackendContract from "../../types/backend/backendContract";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Alumn from "../../types/frontend/alumn-temp";
import generateContractPDF from "../../utils/generateContractPDF";

export default function CreateContracts() {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const preselectedAlumn = (location.state as { alumn?: Alumn } | null)
    ?.alumn;

  const [step, setStep] = useState(1);
  const steps = [
    "Datos del Alumno",
    "Datos Avalista",
    "Datos Contrato",
    "Datos Curso",
    "Confirmación",
  ];
  const [contractData, setContractData] = useState<ContractData>({
    alumn: preselectedAlumn ?? null,
    guarantor: null,
    course: null,
    contract: { contractDate: new Date().toISOString().split("T")[0] }, // Inicializa la fecha de hoy directamente
  });

  const [contract, setContract] = useState<BackendContract | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [modalSuccessIsOpen, setModalSuccessIsOpen] = useState(false);
  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 5));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Update Alumn in Step 1.
  const updateAlumn = (alumn: Alumn | null) => {
    setContractData((prevData) => ({
      ...prevData,
      alumn: alumn ? { ...alumn } : null,
    }));
  };

  // Update Guarantor in Step 2.
  const updateGuarantor = (guarantor: Guarantor | null) => {
    setContractData((prevData) => ({
      ...prevData,
      guarantor: guarantor ? { ...guarantor } : null,
    }));
  };

  //Handle Change  in Step 3.
  // Function handle change date in step3.
  const handleDateChangeContract = (name: string, selectedDates: Date[]) => {
    if (!selectedDates[0]) {
      setContractData((prev) => ({
        ...prev,
        contract: {
          ...prev.contract,
          [name]: "",
        },
      }));
      return;
    }

    const d = selectedDates[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`;

    setContractData((prev) => ({
      ...prev,
      contract: {
        ...prev.contract,
        [name]: localDate,
      },
    }));
  };

  // Función para actualizar el estado del padre
  const handleContractDataChange = (name: string, value: string) => {
    setContractData((prev) => ({
      ...prev, // Mantén el resto de las propiedades de contractData
      contract: {
        ...prev.contract, // Mantén las demás propiedades dentro de contract
        [name]: value, // Actualiza la propiedad dentro de contract
      },
    }));
  };

  //Handle Change datos in Step 4
  const handleCoursetDataChange = (name: string, value: string | Date) => {
    let formattedValue = "";

    console.log(value);

    if (value instanceof Date) {
      // Si el valor es un objeto Date, lo formateamos
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      formattedValue = `${year}-${month}-${day}`;
    } else {
      // Si ya viene como string (ej: desde Flatpickr con dateFormat: "Y-m-d")
      formattedValue = value || "";
    }

    setContractData((prev) => ({
      ...prev,
      course: {
        ...prev.course,
        [name]: formattedValue,
      },
    }));
  };

  const handleDateChangeCourse = (name: string, value: string) => {
    setContractData((prev) => ({
      ...prev, // Mantén el resto de las propiedades de contractData
      course: {
        ...prev.course, // Mantén las demás propiedades dentro de contract
        [name]: value, // Actualiza la propiedad dentro de contract
      },
    }));
  };

  const handleDownload = () => {
    if (contract) {
      const formatDate = (date: any) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("es-ES");
      };

      const contractForPDF = {
        ...contract,
        contractDate: formatDate(contract.contractDate),
        presentationDate: formatDate(contract.presentationDate),
        courseStartDate: formatDate(contract.courseStartDate),
        courseEndDate: formatDate(contract.courseEndDate),
      };

      generateContractPDF(contractForPDF);
    }
  };

  const handleSubmit = async (contractData: ContractData) => {
    setIsLoading(true);

    const transformedData = {
      additionalCourse: contractData.course?.additionalCourse || null,
      alumnId: contractData.alumn?.id,
      classSchedule: contractData.contract?.classSchedule || null,
      contractDate: contractData.contract?.contractDate || null,
      courseEndDate: contractData.course?.courseEndDate || null,
      courseId: contractData.course?.id,
      coursePrice: contractData.course?.price,
      courseStartDate: contractData.course?.startDate || null,
      guarantorAddress: contractData.guarantor?.guarantorAddress || null,
      guarantorBirthDate: contractData.guarantor?.guarantorBirthDate || null,
      guarantorDocumentNumber:
        contractData.guarantor?.guarantorDocumentNumber || null,
      guarantorDocumentType:
        contractData.guarantor?.guarantorDocumentType || null,
      guarantorEmail: contractData.guarantor?.guarantorEmail || null,
      guarantorFirstName: contractData.guarantor?.guarantorFirstName || null,
      guarantorLastName: contractData.guarantor?.guarantorLastName || null,
      guarantorPhone: contractData.guarantor?.guarantorPhone || null,
      guarantorPopulation: contractData.guarantor?.guarantorPopulation || null,
      guarantorPostalCode: contractData.guarantor?.guarantorPostalCode || null,
      guarantorProvince: contractData.guarantor?.guarantorProvince || null,
      hasGuarantor: !!contractData.guarantor,
      latestStudies: contractData.contract?.latestStudies || null,
      missingDocumentation: contractData.contract?.missingDocumentation || null,
      observations: contractData.contract?.observations || "",
      paymentAgreement: contractData.contract?.paymentAgreement || null,
      presentationDate: contractData.contract?.presentationDate || null,
      uniformSize: contractData.contract?.uniformSize || null,
    };

    try {
      const response = await axiosInstance.post("/contracts", transformedData);
      console.log("Formulario enviado exitosamente:", response.data);
      setContract({
        ...response.data,
        user: user
          ? { firstName: user.name, lastName: user.lastname }
          : {
              firstName: "",
              lastName: "",
            },
      });

      console.log(contract);
      setModalSuccessIsOpen(true);
    } catch (error: unknown) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setIsLoading(false); // Desactivar loader cuando termine la petición (éxito o error)
    }
  };

  return (
    <div>
      <PageMeta
        title="Crear Contrato - Esmera School"
        description="Genera y gestiona nuevos contratos en el sistema de administración de Esmera School."
      />
      <PageBreadcrumb pageTitle="Contratos" />

      <div className="space-y-5 sm:space-y-6 flex justify-center">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Barra de Progreso Mejorada */}
          <div className="flex justify-between items-center mb-6 relative">
            {steps.map((label, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                {index > 0 && (
                  <div
                    className={`absolute top-5 left-0 right-0 h-1 transition-all duration-300 ${
                      step > index
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    style={{
                      width: `${(index / (steps.length - 1)) * 100}%`,
                    }}
                  />
                )}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold transition-all duration-300 z-10 ${
                    step === index + 1
                      ? "bg-blue-500 text-white shadow-lg"
                      : step > index + 1
                      ? "bg-blue-300 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs hidden sm:block text-gray-700 dark:text-gray-300 mt-2">
                  {label}
                </span>
              </div>
            ))}
          </div>
          {isLoading ? (
            // Loader cuando está cargando
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Contenido del paso */}
              {step === 1 && (
                <Step1
                  nextStep={nextStep}
                  prevStep={prevStep}
                  step={step}
                  updateAlumn={updateAlumn}
                  contractData={contractData}
                />
              )}
              {step === 2 && (
                <Step2
                  nextStep={nextStep}
                  prevStep={prevStep}
                  step={step}
                  updateGuarantor={updateGuarantor}
                  contractData={contractData}
                />
              )}
              {step === 3 && (
                <Step3
                  nextStep={nextStep}
                  prevStep={prevStep}
                  step={step}
                  onDateChange={handleDateChangeContract}
                  onContractDataChange={handleContractDataChange}
                  contractData={contractData}
                />
              )}
              {step === 4 && (
                <Step4
                  nextStep={nextStep}
                  prevStep={prevStep}
                  step={step}
                  onCourseDataChange={handleCoursetDataChange}
                  onDateChange={handleDateChangeCourse}
                  contractData={contractData}
                />
              )}
              {step === 5 && (
                <Step5
                  prevStep={prevStep}
                  step={step}
                  contractData={contractData}
                  onSubmit={handleSubmit}
                />
              )}
            </>
          )}
        </div>
      </div>
      <SuccessModal
        isOpen={modalSuccessIsOpen}
        closeModal={() => {
          setModalSuccessIsOpen(false);
          setStep(1);
          setContractData({
            alumn: null,
            contract: { contractDate: new Date().toISOString().split("T")[0] },
            guarantor: null,
            course: null,
          });
        }}
        onDownload={handleDownload}
      />
    </div>
  );
}
