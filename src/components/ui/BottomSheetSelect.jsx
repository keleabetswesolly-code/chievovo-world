import React, { useState } from "react";
import { Drawer } from "vaul";
import { Check, ChevronDown } from "lucide-react";

/**
 * Mobile-friendly bottom-sheet select replacing Radix popovers.
 * Props: value, onValueChange, options (string[]), label (optional)
 */
export default function BottomSheetSelect({ value, onValueChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00D4FF]"
        >
          <span className={value ? "text-white" : "text-gray-500"}>{value || placeholder}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl focus:outline-none"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-5 pt-2 pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Select</p>
          </div>
          <div className="px-3 pb-8 space-y-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onValueChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all hover:bg-white/5"
                style={value === opt ? { background: '#00D4FF15', color: '#00D4FF' } : { color: '#fff' }}
              >
                <span>{opt}</span>
                {value === opt && <Check className="w-4 h-4 text-[#00D4FF]" />}
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}