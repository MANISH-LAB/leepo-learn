import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AnalyticsTab } from "./AnalyticsTab";
import { UserTab } from "./UserTab";
import { CourseManagerTab } from "./CourseManagerTab";
import { PriceManagerTab } from "./PriceManagerTab";
import { Node } from "../../utils/sharedData";

interface AdminDashboardProps {
  courseData: Node[];
  setCourseData: (data: Node[]) => void;
}

export function AdminDashboard({ courseData, setCourseData }: AdminDashboardProps) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Leepo Learn - Admin</h1>
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="analytics">Analytics & Users</TabsTrigger>
          <TabsTrigger value="content">Course Manager</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
          <UserTab />
        </TabsContent>
        <TabsContent value="content">
          <CourseManagerTab courseData={courseData} setCourseData={setCourseData} />
        </TabsContent>
        <TabsContent value="pricing">
          <PriceManagerTab courseData={courseData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
