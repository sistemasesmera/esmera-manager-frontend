import { useEffect, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import LeadInfoPanel from "../../components/LeadInfoPanel";
import AlertContractMonday from "../../components/AlertContractMonday";
export default function CreateContractsMonday() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  const itemId = searchParams.get("itemId");

  const steps = [
    "Datos del Alumno",
    "Datos Avalista",
    "Datos Contrato",
    "Datos Curso",
    "Confirmación",
  ];

  const [contractData, setContractData] = useState<ContractData>({
    alumn: null,
    guarantor: null,
    course: null,
    contract: { contractDate: new Date().toISOString().split("T")[0] },
  });

  const [contract, setContract] = useState<BackendContract | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [modalSuccessIsOpen, setModalSuccessIsOpen] = useState(false);

  const [isValidItem, setIsValidItem] = useState<boolean | null>(null);
  const [statusColumnId, setStatusColumnId] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [itemData, setItemData] = useState<any>(null);

  useEffect(() => {
    if (!itemId) return;

    const validate = async () => {
      try {
        console.log(statusColumnId);
        console.log(boardId);
        const response = await axiosInstance.get(
          `/leads/validate-item?itemId=${itemId}`
        );
        console.log(response);
        // La API retorna: { exists: boolean, boardId?: string, statusColumnId?: string, item?: any }
        setIsValidItem(response.data.exists);
        setBoardId(response.data.boardId || null);
        setStatusColumnId(response.data.statusColumnId || null);

        if (response.data.exists) {
          setItemData(response.data); // Guardamos los datos del Lead
        }
      } catch (error) {
        console.error("Error validating item:", error);
        setIsValidItem(false);
      }
    };

    validate();
  }, [itemId]);

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
    setContractData((prev) => ({
      ...prev, // Preservamos las demás propiedades de contractData
      contract: {
        ...prev.contract, // Preservamos las demás propiedades dentro de contract
        [name]: selectedDates[0]
          ? selectedDates[0].toISOString().split("T")[0] // Convertimos la fecha al formato "YYYY-MM-DD"
          : "", // Si no se selecciona una fecha, asignamos un string vacío
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
  const handleCoursetDataChange = (name: string, value: string) => {
    setContractData((prev) => ({
      ...prev, // Mantén el resto de las propiedades de contractData
      course: {
        ...prev.course, // Mantén las demás propiedades dentro de contract
        [name]: value, // Actualiza la propiedad dentro de contract
      },
    }));
  };

  const handleDateChangeCourse = (name: string, value: string) => {
    setContractData((prev) => ({
      ...prev, // Mantén el resto de las propiedades de contractData
      course: {
        ...prev.course, // Mantén las demás propiedades dentro de contract
        [name]: value, // Actualiza la propiedad dentro decontract
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
      setIsLoading(false);
    }
  };

  if (!itemId) {
    return (
      <AlertContractMonday
        message={`Hola ${user?.name}, no puedes generar contratos aún. Por favor, primero selecciona el cliente en el CRM / Monday.`}
      />
    );
  }

  if (isValidItem === null) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isValidItem) {
    return (
      <AlertContractMonday
        message={`Lo sentimos, ${user?.name}. El cliente potencial que estás intentando acceder no existe o no es válido en el CRM.`}
      />
    );
  }

  if (!itemData.statusColumnId) {
    return (
      <AlertContractMonday
        message={`Lo siento, ${user?.name}. El Item del Lead no tiene identificador de la columna Estado. No podremos actualizar el Estado a Matriculado luego de matricular.`}
      />
    );
  }

  return (
    <div>
      <PageMeta
        title="Crear Contrato - Esmera School"
        description="Genera y gestiona nuevos contratos en el sistema de administración de Esmera School."
      />
      <PageBreadcrumb pageTitle="Contratos" />

      <div className="space-y-5 sm:space-y-6 flex justify-center">
        {itemData && <LeadInfoPanel item={itemData} />}

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
