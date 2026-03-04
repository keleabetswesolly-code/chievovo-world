import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, subtitle, link, linkText = "See All" }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {link && (
        <Link 
          to={link}
          className="flex items-center gap-1 text-sm text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors font-medium"
        >
          {linkText}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}