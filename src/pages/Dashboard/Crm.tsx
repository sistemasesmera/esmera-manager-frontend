import CrmMetrics from "../../components/crm/CrmMetrics";
import CrmRecentOrder from "../../components/crm/CrmRecentOrderTable";
import SalePieChart from "../../components/crm/SalePieChart";
import UpcomingContactsWidget from "../../components/crm/UpcomingContactsWidget";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function Crm() {
  return (
    <>
      <PageMeta
        title="Resumen CRM - Esmera School"
        description="Resumen del pipeline de leads de Esmera School."
      />
      <PageBreadcrumb pageTitle="Resumen CRM" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <CrmMetrics />
        </div>

        <div className="col-span-12">
          <UpcomingContactsWidget />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <SalePieChart />
        </div>

        <div className="col-span-12">
          <CrmRecentOrder />
        </div>
      </div>
    </>
  );
}
