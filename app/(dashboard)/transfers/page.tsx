import { TransferFlow } from "@/components/scout/transfer-flow";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transfer Intelligence | ScoutPro',
  description: 'AI-driven transfer flow mapping and player valuation intelligence.',
};

export default function TransfersPage() {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Transfer Flow Intelligence <span className="text-primary text-lg font-medium ml-2 font-mono">F15</span>
        </h1>
        <p className="text-white/50 max-w-2xl">
          Visualizing global player movement and leveraging AI to evaluate market transactions in real-time.
        </p>
      </header>

      <section>
        <TransferFlow teamId="1" />
      </section>

      <footer className="pt-8 border-t border-white/5">
        <div className="flex items-center gap-6 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Incoming Transfers (In)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Outgoing Transfers (Out)</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span>Data provided by</span>
            <span className="text-primary font-bold">Statorium API</span>
            <span className="mx-1">&bull;</span>
            <span>Appraisal by</span>
            <span className="text-primary font-bold">Claude 3.5 Sonnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
