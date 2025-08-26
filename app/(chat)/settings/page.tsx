import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import AppearanceSettings from "@/components/appearance-settings";

const page = () => {
  return (
    <div className="container max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <AppearanceSettings />
      </Card>
    </div>
  );
};

export default page;
