"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface BotFormData {
  name: string;
  primary_color: string;
  welcome_message: string;
  logo_url: string;
}

interface BotCustomizerProps {
  value: BotFormData;
  onChange: (value: BotFormData) => void;
}

export function BotCustomizer({ value, onChange }: BotCustomizerProps) {
  const update = (field: keyof BotFormData, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bot Name
        </label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="My Company Assistant"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Welcome Message
        </label>
        <textarea
          value={value.welcome_message}
          onChange={(e) => update("welcome_message", e.target.value)}
          placeholder="Hi! How can I help you today?"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Color
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:border-gray-400 transition-colors w-full">
              <div
                className="w-5 h-5 rounded-full border border-gray-200"
                style={{ backgroundColor: value.primary_color }}
              />
              <span className="text-gray-700 font-mono">{value.primary_color}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker
              color={value.primary_color}
              onChange={(color) => update("primary_color", color)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL (optional)
        </label>
        <input
          type="url"
          value={value.logo_url}
          onChange={(e) => update("logo_url", e.target.value)}
          placeholder="https://example.com/logo.png"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
