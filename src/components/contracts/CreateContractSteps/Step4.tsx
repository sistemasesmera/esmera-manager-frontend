import React, { useState, useEffect } from "react";
import Label from "../../form/Label";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../../icons";
import Select from "../../form/Select";
import Input from "../../form/input/InputField";
import axiosInstance from "../../../axios/axiosConfig";
import ContractData from "../../../types/frontend/contractData";

interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
  step: number;
  onCourseDataChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: string) => void;
  contractData: ContractData;
}

interface Course {
  id: string;
  name: string;
}

const Step4: React.FC<StepProps> = ({
  nextStep,
  prevStep,
  step,
  onCourseDataChange,
  onDateChange,
  contractData,
}) => {
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [stateNextButton, setStateNextButton] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  // Cargar los cursos desde la API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses/selects");
        setCourses(response.data); // Asumimos que `response.data` es un array con { id, name }
      } catch (error) {
        console.error("Error al cargar los cursos", error);
      }
    };
    fetchCourses();
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "price" && !/^[0-9]*$/.test(value)) {
      return; // Evita que se ingresen caracteres no numéricos
    }

    onCourseDataChange(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: value ? "" : "Este campo es obligatorio",
    }));
  };

  const handleSelectChange = (value: string) => {
    const selectedCourse = courses.find((course) => course.id === value);

    onCourseDataChange("id", value);
    onCourseDataChange("name", selectedCourse ? selectedCourse.name : ""); // Guardamos el nombre también
    setValidationErrors((prev) => ({
      ...prev,
      id: value ? "" : "Este campo es obligatorio",
    }));
  };
  const handleDateChangeDateStart = (selectedDates: Date[]) => {
    let formattedDate = "";

    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      formattedDate = `${year}-${month}-${day}`;
    }

    onDateChange("startDate", formattedDate);
  };

  const handleDateChangeDateFinish = (selectedDates: Date[]) => {
    let formattedDate = "";

    if (selectedDates.length > 0) {
      const d = selectedDates[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      formattedDate = `${year}-${month}-${day}`;
    }

    onDateChange("courseEndDate", formattedDate);
  };

  useEffect(() => {
    setStateNextButton(
      !!(contractData.course?.id && contractData.course?.price)
    );
  }, [contractData]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Datos Curso
      </h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1 sm:col-span-2">
          <Label>Curso</Label>
          <Select
            options={courses.map((course) => ({
              value: course.id,
              label: course.name,
            }))}
            defaultValue={contractData.course?.id}
            onChange={handleSelectChange}
            placeholder="Seleccionar un curso"
            className={`dark:bg-dark-900 border ${
              validationErrors.id ? "border-red-500" : ""
            }`}
          />
          {validationErrors.id && (
            <p className="text-red-500 text-sm">{validationErrors.id}</p>
          )}
        </div>

        <div className="col-span-1">
          <Label>Precio</Label>
          <Input
            type="text"
            name="price"
            placeholder="0"
            value={contractData.course?.price}
            onChange={handleChange}
            className={validationErrors.price ? "border-red-500" : ""}
          />
          {validationErrors.price && (
            <p className="text-red-500 text-sm">{validationErrors.price}</p>
          )}
        </div>

        <div className="col-span-1">
          <Label>Fecha de Inicio</Label>
          <div className="relative w-full">
            <Flatpickr
              value={contractData.course?.startDate}
              onChange={(dates) => handleDateChangeDateStart(dates)}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Seleccionar fecha de inicio"
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>
        </div>

        <div className="col-span-1">
          <Label>Curso Adicional</Label>
          <Input
            type="text"
            name="additionalCourse"
            placeholder="Ejemplo"
            value={contractData.course?.additionalCourse}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-1">
          <Label>Fecha de Fin</Label>
          <div className="relative w-full">
            <Flatpickr
              value={contractData.course?.courseEndDate}
              onChange={(dates) => handleDateChangeDateFinish(dates)}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Seleccionar fecha de fin"
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md disabled:opacity-50"
          disabled={step === 1}
        >
          Anterior
        </button>

        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          disabled={!stateNextButton}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Step4;
