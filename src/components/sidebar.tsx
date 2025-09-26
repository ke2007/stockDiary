"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Bookmark, TrendingUp, TrendingDown, Clock, Tag, BarChart3 } from "lucide-react";
import { Category } from "@/types";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function Sidebar({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col">
        <SidebarContent 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  const menuItems = [
    { id: "all", label: "전체 매매", icon: Home },
    { id: "profit", label: "익절", icon: TrendingUp },
    { id: "loss", label: "손절", icon: TrendingDown },
    { id: "recent", label: "최근 매매", icon: Clock },
    { id: "dashboard", label: "통계", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 drop-shadow-sm">📊 매매 유형</h2>
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedCategory === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start glass-button transition-all duration-300 ${
                  isSelected 
                    ? "bg-gray-200 text-gray-800 border-gray-300 shadow-lg" 
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-100"
                }`}
                onClick={() => onCategoryChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="w-full h-px bg-gray-200 my-6"></div>


      <div className="mt-auto">
        <div className="glass-card rounded-lg p-4">
          <div className="text-sm">
            <div className="font-medium mb-2 text-gray-800">💡 트레이딩 팁</div>
            <div className="text-gray-600 text-xs">
              매매 기록을 꾸준히 작성하고 분석하여 트레이딩 실력을 향상시키세요!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}