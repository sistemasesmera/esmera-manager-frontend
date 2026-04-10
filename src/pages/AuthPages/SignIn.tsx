import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Inicio de Sesion - Esmera School"
        description="Accede a Esmera Gestión, la plataforma exclusiva para empleados de Esmera School. Inicia sesión para gestionar contratos, documentos y otros procesos administrativos de manera segura y eficiente"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
