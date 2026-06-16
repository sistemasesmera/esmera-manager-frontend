import { BrowserRouter as Router, Routes, Route } from "react-router";
import Ecommerce from "./pages/Dashboard/Ecommerce";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Carousel from "./pages/UiElements/Carousel";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Pagination from "./pages/UiElements/Pagination";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import ButtonsGroup from "./pages/UiElements/ButtonsGroup";
import Notifications from "./pages/UiElements/Notifications";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import PieChart from "./pages/Charts/PieChart";
import Invoices from "./pages/Invoices";
import FileManager from "./pages/FileManager";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import DataTables from "./pages/Tables/DataTables";
import PricingTables from "./pages/PricingTables";
import Faqs from "./pages/Faqs";
import Chats from "./pages/Chat/Chats";
import FormElements from "./pages/Forms/FormElements";
import FormLayout from "./pages/Forms/FormLayout";
import Blank from "./pages/Blank";
import EmailInbox from "./pages/Email/EmailInbox";
import EmailDetails from "./pages/Email/EmailDetails";
import TaskKanban from "./pages/Task/TaskKanban";
import BreadCrumb from "./pages/UiElements/BreadCrumb";
import Cards from "./pages/UiElements/Cards";
import Dropdowns from "./pages/UiElements/Dropdowns";
import Links from "./pages/UiElements/Links";
import Lists from "./pages/UiElements/Lists";
import Popovers from "./pages/UiElements/Popovers";
import Progressbar from "./pages/UiElements/Progressbar";
import Ribbons from "./pages/UiElements/Ribbons";
import Spinners from "./pages/UiElements/Spinners";
import Tabs from "./pages/UiElements/Tabs";
import Tooltips from "./pages/UiElements/Tooltips";
import Modals from "./pages/UiElements/Modals";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import TaskList from "./pages/Task/TaskList";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import MyContracts from "./pages/Contracts/MyContracts";
import CreateContracts from "./pages/Contracts/CreateContracts";
import Alumns from "./pages/Alumns/Alumns";
import Courses from "./pages/Courses/Courses";
import Commercials from "./pages/Commercials/Commercials";
import { NotificationProvider } from "./context/NotificationContext";
import InformesPage from "./pages/Informes/InformesPage";
import Contracts from "./pages/Contracts/Contracts";
import DashboardComerciales from "./pages/Dashboard/Dashboard";
import Leads from "./pages/Leads/Leads";
import LeadsPipeline from "./pages/Leads/LeadsPipeline";
import LeadDetail from "./pages/Leads/LeadDetail";
import Crm from "./pages/Dashboard/Crm";
import ManualUsuario from "./pages/Manual/ManualUsuario";
import ActivityLogPage from "./pages/Activity/ActivityLog";
import AlumnDetail from "./pages/Alumns/AlumnDetail";

export default function App() {
  return (
    <>
      {" "}
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Private Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Ecommerce />} />

                {/* RUTAS SOLO PARA ADMIN Y COMERCIAL PLUS*/}
                <Route
                  element={
                    <ProtectedRoute
                      requiredRoles={["ADMIN", "COMMERCIAL_PLUS"]}
                    />
                  }
                >
                  <Route path="/commercials" element={<Commercials />} />
                  <Route path="/informes" element={<InformesPage />} />
                  <Route path="/activity" element={<ActivityLogPage />} />
                </Route>

                {/* Contracts Page*/}
                <Route path="/my-contracts" element={<MyContracts />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contract-create" element={<CreateContracts />} />

                {/* Alumns Page*/}
                <Route path="/alumns" element={<Alumns />} />
                <Route path="/alumns/:id" element={<AlumnDetail />} />

                {/* Leads Page*/}
                <Route path="/leads" element={<Leads />} />
                <Route path="/leads/pipeline" element={<LeadsPipeline />} />
                <Route path="/leads/:id" element={<LeadDetail />} />
                <Route path="/crm" element={<Crm />} />

                {/* Courses Page*/}
                <Route path="/courses" element={<Courses />} />

                <Route path="/dashboard" element={<DashboardComerciales />} />

                {/* Manual de Usuario */}
                <Route path="/manual" element={<ManualUsuario />} />

                {/* 404 Route */}
                <Route path="/*" element={<NotFound />} />

                {/* Others Page */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/invoice" element={<Invoices />} />
                <Route path="/faq" element={<Faqs />} />
                <Route path="/pricing-tables" element={<PricingTables />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/form-layout" element={<FormLayout />} />
                <Route path="/chat" element={<Chats />} />
                <Route path="/task-list" element={<TaskList />} />
                <Route path="/task-kanban" element={<TaskKanban />} />
                <Route path="/file-manager" element={<FileManager />} />
                <Route path="/inbox" element={<EmailInbox />} />
                <Route path="/inbox-details" element={<EmailDetails />} />
                <Route path="/basic-tables" element={<BasicTables />} />
                <Route path="/data-tables" element={<DataTables />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/breadcrumb" element={<BreadCrumb />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/buttons-group" element={<ButtonsGroup />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/carousel" element={<Carousel />} />
                <Route path="/dropdowns" element={<Dropdowns />} />
                <Route path="/images" element={<Images />} />
                <Route path="/links" element={<Links />} />
                <Route path="/list" element={<Lists />} />
                <Route path="/modals" element={<Modals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/pagination" element={<Pagination />} />
                <Route path="/popovers" element={<Popovers />} />
                <Route path="/progress-bar" element={<Progressbar />} />
                <Route path="/ribbons" element={<Ribbons />} />
                <Route path="/spinners" element={<Spinners />} />
                <Route path="/tabs" element={<Tabs />} />
                <Route path="/tooltips" element={<Tooltips />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
                <Route path="/pie-chart" element={<PieChart />} />
              </Route>
            </Route>

            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Routes>
        </Router>{" "}
      </NotificationProvider>
    </>
  );
}
