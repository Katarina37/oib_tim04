import type { FC } from "react";
import { Navbar } from "../components/dashboard/navbar/Navbar";
import { IUserAPI } from "../api/users/IUserAPI";

type DashboardPageProps = {
  userAPI: IUserAPI;
};

const DashboardPage: FC<DashboardPageProps> = ({ userAPI }) => {
  return (
    <div className="flex h-full">
      <Navbar userAPI={userAPI} />
      <main className="flex-1 p-4">
        <h1>Dashboard</h1>
      </main>
    </div>
  );
};

export default DashboardPage;