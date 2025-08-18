import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import Link from "next/link";

const Overview = () => {
  return (
    <div className="">
      <div className="overviewItem my-8 max-w-3xl">
        <div className="flex items-center mb-4 justify-between">
          <h2 className="text-md font-semibold">Deine aktiven Projekte</h2>
          <div className="flex cursor-pointer items-center gap-2">
            <Link href="/projects" className="font-light">
              Zur Übersicht
            </Link>
            <ArrowRight size={14} />
          </div>
        </div>
        {/* <ProjectsGrid screen="home" /> */}
      </div>
    </div>
  );
};

export default Overview;
